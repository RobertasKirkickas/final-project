from django.db.models import Sum, Count
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.http import Http404
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from api.serializers import ChangePasswordSerializer
from django.db.models import Q

# Documentation tool (Swagger)
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

# Custom Imports
from api import models as api_models
from api import serializers as api_serializers

# Authentication and User Management

#  JWT login and token generation
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializers.MyTokenObtainPairSerializer

# User registration
class RegisterView(generics.CreateAPIView):
    queryset = api_models.User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializers.RegisterSerializer

# Returns volunteer profile by user ID
class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializers.ProfileSerializer

    def get_object(self):
        user_id = self.kwargs.get('user_id')
        return api_models.Profile.objects.get(user__id=user_id)

# Public API Endpoints for Categories and Posts

# Lists report categories like parks or streets
class CategoryListAPIView(generics.ListAPIView):
    serializer_class = api_serializers.CategorySerializer
    queryset = api_models.Category.objects.all()
    permission_classes = [AllowAny]

# Lists all public reports excluding Disabled status
class PostListAPIView(generics.ListAPIView):
    serializer_class = api_serializers.PostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return api_models.Post.objects.exclude(status="Disabled").order_by('-date')

# Filters reports by category slug
class PostCategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, category_slug):
        try:
            # Retrieve the specific category object by slug
            category = api_models.Category.objects.get(slug=category_slug)
        except api_models.Category.DoesNotExist:
            return Response({"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve all active posts linked to this category
        posts = api_models.Post.objects.filter(category=category).exclude(status="Disabled")

        category_serializer = api_serializers.CategorySerializer(category)
        posts_serializer = api_serializers.PostSerializer(posts, many=True, context={'request': request})
        
        return Response({
            "category": category_serializer.data,
            "posts": posts_serializer.data
        }, status=status.HTTP_200_OK)

# Detail view for a report. Increments view count
class PostDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializers.PostSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_object(self):
        slug = self.kwargs['slug']
        post = api_models.Post.objects.get(slug=slug)

        # If the report is disabled, we return a 404 to hide it from public view
        if post.status == "Disabled":
            raise Http404("This report is disabled and no longer public.")

        # If everything is fine, we increment the view count and save
        post.view += 1
        post.save()
        
        return post

# Interactions with posts (like, comment, bookmark)

# Handles liking/unliking logic and notifications
class LikePostAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'user_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                'post_id': openapi.Schema(type=openapi.TYPE_INTEGER),
            },
        ),
    )
    def post(self, request):
        user = get_object_or_404(api_models.User, id=request.data['user_id'])
        post = get_object_or_404(api_models.Post, id=request.data['post_id'])

        if user in post.likes.all():
            post.likes.remove(user)
            return Response({"message": "Report Unliked"}, status=status.HTTP_200_OK)
        else:
            post.likes.add(user)
            api_models.Notification.objects.create(
                user=post.user, # Notify the report owner
                sender=user, # The user who liked the report
                post=post, 
                type="Like"
            )
            return Response({"message": "Report Liked"}, status=status.HTTP_201_CREATED)

# Adds a comment and notifies the reporter
class PostCommentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'post_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                'name': openapi.Schema(type=openapi.TYPE_STRING),
                'email': openapi.Schema(type=openapi.TYPE_STRING),
                'comment': openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
    )
    def post(self, request):
        post = get_object_or_404(api_models.Post, id=request.data['post_id'])
        
        api_models.Comment.objects.create(
            post=post,
            name=request.data['name'],
            email=request.data['email'],
            comment=request.data['comment']
        )
        api_models.Notification.objects.create(
            user=post.user, 
            sender=request.user, 
            post=post, 
            type="Comment"
        )
        return Response({"message": "Comment Sent"}, status=status.HTTP_201_CREATED)

# Handles joining/leaving clean-up events and notifications
class JoinPostAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'user_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                'post_id': openapi.Schema(type=openapi.TYPE_INTEGER),
            },
        ),
    )
    def post(self, request):
        user = get_object_or_404(api_models.User, id=request.data['user_id'])
        post = get_object_or_404(api_models.Post, id=request.data['post_id'])

        if user in post.attendees.all():
            post.attendees.remove(user)
            return Response({"message": "Left the event"}, status=status.HTTP_200_OK)
        else:
            post.attendees.add(user)
            api_models.Notification.objects.create(
                user=post.user, 
                sender=user, 
                post=post, 
                type="Join"
            )
            return Response({"message": "Joined the event"}, status=status.HTTP_201_CREATED)

# Handles bookmarking/unbookmarking reports.
class BookmarkPostAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'user_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                'post_id': openapi.Schema(type=openapi.TYPE_INTEGER),
            },
        ),
    )
    def post(self, request):
        user = get_object_or_404(api_models.User, id=request.data['user_id'])
        post = get_object_or_404(api_models.Post, id=request.data['post_id'])
        bookmark = api_models.Bookmark.objects.filter(post=post, user=user).first()

        if bookmark:
            bookmark.delete()
            return Response({"message": "Report Unsaved"}, status=status.HTTP_200_OK)
        else:
            api_models.Bookmark.objects.create(user=user, post=post)
            api_models.Notification.objects.create(
                user=post.user, 
                sender=user, 
                post=post, 
                type="Bookmark"
            )
            return Response({"message": "Report Saved"}, status=status.HTTP_201_CREATED)
        

# Dashboard API Endpoints for Volunteers

# Shows statistics in the dashboard including total views, posts, likes, and bookmarks
class DashboardStats(generics.ListAPIView):
    serializer_class = api_serializers.UserStatsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        user = api_models.User.objects.get(id=user_id)

        views = api_models.Post.objects.filter(user=user).aggregate(v=Sum("view"))['v'] or 0
        posts = api_models.Post.objects.filter(user=user).count()
        likes = api_models.Post.objects.filter(user=user).annotate(lc=Count('likes')).aggregate(total=Sum('lc'))['total'] or 0
        bookmarks = api_models.Bookmark.objects.filter(post__user=user).count()

        return [{
            "views": views,
            "posts": posts,
            "likes": likes,
            "bookmarks": bookmarks,
        }]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Lists all posts created by a volunteer in the dashboard
class DashboardPostLists(generics.ListAPIView):
    serializer_class = api_serializers.PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return api_models.Post.objects.filter(user__id=user_id).order_by("-id")

# Lists all comments on the volunteer's posts in the dashboard
class DashboardCommentLists(generics.ListAPIView):
    serializer_class = api_serializers.CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return api_models.Comment.objects.filter(post__user__id=user_id).order_by("-id")
    
    def delete(self, request, user_id, comment_id):
        try:
            comment = api_models.Comment.objects.get(id=comment_id, post__user__id=user_id)
            comment.delete()
            return Response({"message": "Comment deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except api_models.Comment.DoesNotExist:
            return Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)

# Lists all unseen notifications for a volunteer in the dashboard
class DashboardNotificationsList(generics.ListAPIView):
    serializer_class = api_serializers.NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return api_models.Notification.objects.filter(seen=False, user__id=user_id)

# Updates notification status to 'seen'
class DashboardMarkNotificationAsSeen(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        noti = api_models.Notification.objects.get(id=request.data['noti_id'])
        noti.seen = True
        noti.save()
        return Response({"message": "Notification marked as seen"}, status=status.HTTP_200_OK)

# Allows a volunteer to reply to a specific comment on their report from the dashboard
class DashboardReplyCommentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        comment = api_models.Comment.objects.get(id=request.data['comment_id'])
        comment.reply = request.data['reply']
        comment.save()
        return Response({"message": "Comment response sent"}, status=status.HTTP_201_CREATED)

# Allows a volunteer to create a new litter report from the dashboard
class DashboardPostCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializers.PostSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = api_models.User.objects.get(id=request.data.get('user_id'))
        category = get_object_or_404(api_models.Category, id=request.data.get('category'))
        
        post = api_models.Post.objects.create(
            user=user,
            profile=user.profile,
            title=request.data.get('title'),
            image=request.FILES.get('image'),
            description=request.data.get('description'),
            tags=request.data.get('tags'),
            category=category,
            status=request.data.get('status', 'Reported'),
            scheduled_date=request.data.get('scheduled_date'),
            scheduled_time=request.data.get('scheduled_time')
        )

        for key in request.FILES:
            if key.startswith('image_'):
                api_models.PostImage.objects.create(
                    post=post,
                    image=request.FILES.get(key)
                )

        return Response({"message": "Report created successfully"}, status=status.HTTP_201_CREATED)

# Allows a volunteer to update or delete an existing litter report from the dashboard
class DashboardPostEditAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializers.PostSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return api_models.Post.objects.get(id=self.kwargs.get('post_id'), user__id=self.kwargs.get('user_id'))
    
    def update(self, request, *args, **kwargs):
        post = self.get_object()
        category = api_models.Category.objects.get(id=request.data.get('category'))

        post.title = request.data.get('title')
        if request.FILES.get('image') and request.FILES.get('image') != "undefined":
            post.image = request.FILES.get('image')

        post.description = request.data.get('description')
        post.tags = request.data.get('tags')
        post.category = category
        post.status = request.data.get('post_status')
        post.scheduled_date = request.data.get('scheduled_date')
        post.scheduled_time = request.data.get('scheduled_time')
        post.save()

        new_extra_images = [key for key in request.FILES if key.startswith('image_')]

        if new_extra_images:
            # Delete old extra images if new ones are provided
            api_models.PostImage.objects.filter(post=post).delete()

            for key in new_extra_images:
                api_models.PostImage.objects.create(
                    post=post,
                    image=request.FILES.get(key)
                )

        return Response({"message": "Report updated successfully"}, status=status.HTTP_200_OK)
    
# Deletes the 'deleted' image/s on save
class PostImageDeleteAPIView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = api_models.PostImage.objects.all()

    def get_object(self):
        # Ensure that the image being deleted belongs to the post and user making the request
        image_id = self.kwargs.get('image_id')
        post_id = self.kwargs.get('post_id')
        return get_object_or_404(
            api_models.PostImage, 
            id=image_id, 
            post__id=post_id, 
            post__user=self.request.user
        )

# Allows a volunteer to change their password in the profile page
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Initialise the serializer with request data
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            # Check if the current password is correct
            if not user.check_password(serializer.data.get("current_password")):
                return Response({"message": "Wrong current password"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Set and save the new password
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

        # Return validation errors if serializer is not valid
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# Allows users to search for reports
class PostSearchAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.GET.get('q') # Get the search query
        if query:
            # Search for posts containing the query
            posts = api_models.Post.objects.filter(
                Q(title__icontains=query) | 
                Q(description__icontains=query) |
                Q(category__title__icontains=query)
            ).exclude(status="Disabled").distinct()
        else:
            posts = api_models.Post.objects.none()

        serializer = api_serializers.PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)