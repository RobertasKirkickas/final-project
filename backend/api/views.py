from django.db.models import Sum, Count
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

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
class PostCategoryListAPIView(generics.ListAPIView):
    serializer_class = api_serializers.PostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        category_slug = self.kwargs['category_slug']
        return api_models.Post.objects.filter(category__slug=category_slug).exclude(status="Disabled")

# Detail view for a report. Increments view count
class PostDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializers.PostSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_object(self):
        slug = self.kwargs['slug']
        post = api_models.Post.objects.get(slug=slug)
        if post.status != "Disabled":
            post.view += 1
            post.save()
        return post

# Interactions with posts (like, comment, bookmark)

# Handles liking/unliking logic and notifications
class LikePostAPIView(APIView):
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
        user = api_models.User.objects.get(id=request.data['user_id'])
        post = api_models.Post.objects.get(id=request.data['post_id'])

        if user in post.likes.all():
            post.likes.remove(user)
            return Response({"message": "Post Unliked"}, status=status.HTTP_200_OK)
        else:
            post.likes.add(user)
            api_models.Notification.objects.create(user=post.user, post=post, type="Like")
            return Response({"message": "Post Liked"}, status=status.HTTP_201_CREATED)

# Adds a comment and notifies the reporter
class PostCommentAPIView(APIView):
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
        post = api_models.Post.objects.get(id=request.data['post_id'])
        api_models.Comment.objects.create(
            post=post,
            name=request.data['name'],
            email=request.data['email'],
            comment=request.data['comment']
        )
        api_models.Notification.objects.create(user=post.user, post=post, type="Comment")
        return Response({"message": "Comment Sent"}, status=status.HTTP_201_CREATED)

# Handles joining/leaving clean-up events and notifications
class JoinPostAPIView(APIView):
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
        user = api_models.User.objects.get(id=request.data['user_id'])
        post = api_models.Post.objects.get(id=request.data['post_id'])

        if user in post.attendees.all():
            post.attendees.remove(user)
            return Response({"message": "Left the event"}, status=status.HTTP_200_OK)
        else:
            post.attendees.add(user)
            api_models.Notification.objects.create(user=post.user, post=post, type="Join")
            return Response({"message": "Joined the event"}, status=status.HTTP_201_CREATED)

# Handles bookmarking/unbookmarking reports.
class BookmarkPostAPIView(APIView):
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
        user = api_models.User.objects.get(id=request.data['user_id'])
        post = api_models.Post.objects.get(id=request.data['post_id'])
        bookmark = api_models.Bookmark.objects.filter(post=post, user=user).first()

        if bookmark:
            bookmark.delete()
            return Response({"message": "Bookmark Removed"}, status=status.HTTP_200_OK)
        else:
            api_models.Bookmark.objects.create(user=user, post=post)
            api_models.Notification.objects.create(user=post.user, post=post, type="Bookmark")
            return Response({"message": "Post Bookmarked"}, status=status.HTTP_201_CREATED)
        

# Dashboard API Endpoints for Volunteers

# Shows statistics in the dashboard including total views, posts, likes, and bookmarks
class DashboardStats(generics.ListAPIView):
    serializer_class = api_serializers.UserStatsSerializer
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return api_models.Post.objects.filter(user__id=user_id).order_by("-id")

# Lists all comments on the volunteer's posts in the dashboard
class DashboardCommentLists(generics.ListAPIView):
    serializer_class = api_serializers.CommentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return api_models.Comment.objects.filter(post__user__id=user_id).order_by("-id")

# Lists all unseen notifications for a volunteer in the dashboard
class DashboardNotificationsList(generics.ListAPIView):
    serializer_class = api_serializers.NotificationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return api_models.Notification.objects.filter(seen=False, user__id=user_id)

# Updates notification status to 'seen'
class DashboardMarkNotificationAsSeen(APIView):
    def post(self, request):
        noti = api_models.Notification.objects.get(id=request.data['noti_id'])
        noti.seen = True
        noti.save()
        return Response({"message": "Notification marked as seen"}, status=status.HTTP_200_OK)

# Allows a volunteer to reply to a specific comment on their report from the dashboard
class DashboardReplyCommentAPIView(APIView):
    def post(self, request):
        comment = api_models.Comment.objects.get(id=request.data['comment_id'])
        comment.reply = request.data['reply']
        comment.save()
        return Response({"message": "Comment response sent"}, status=status.HTTP_201_CREATED)

# Allows a volunteer to create a new litter report from the dashboard
class DashboardPostCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializers.PostSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user = api_models.User.objects.get(id=request.data.get('user_id'))
        category = api_models.Category.objects.get(id=request.data.get('category'))
        
        api_models.Post.objects.create(
            user=user,
            profile=user.profile,
            title=request.data.get('title'),
            image=request.data.get('image'),
            description=request.data.get('description'),
            tags=request.data.get('tags'),
            category=category,
            status=request.data.get('post_status', 'Reported')
        )
        return Response({"message": "Post created successfully"}, status=status.HTTP_201_CREATED)

# Allows a volunteer to update or delete an existing litter report from the dashboard
class DashboardPostEditAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializers.PostSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return api_models.Post.objects.get(id=self.kwargs.get('post_id'), user__id=self.kwargs.get('user_id'))
    
    def update(self, request, *args, **kwargs):
        post = self.get_object()
        category = api_models.Category.objects.get(id=request.data.get('category'))

        post.title = request.data.get('title')
        if request.data.get('image') and request.data.get('image') != "undefined":
            post.image = request.data.get('image')
        post.description = request.data.get('description')
        post.tags = request.data.get('tags')
        post.category = category
        post.status = request.data.get('post_status')
        post.save()

        return Response({"message": "Post updated successfully"}, status=status.HTTP_200_OK)