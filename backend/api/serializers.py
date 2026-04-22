from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from api import models as api_models

# JWT Token Serializer
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['full_name'] = user.full_name
        token['email'] = user.email
        token['username'] = user.username
        return token

# Registration Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = api_models.User
        fields = ['full_name', 'email', 'password', 'password2']

    def validate(self, attr):
        if attr['password'] != attr['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return attr
    
    def create(self, validated_data):
        user = api_models.User.objects.create(
            full_name=validated_data['full_name'],
            email=validated_data['email'],
        )
        
        email_username, _ = user.email.split('@')
        user.username = email_username
        user.set_password(validated_data['password'])
        user.save()
        return user

# User and Profile Serializers
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.User
        fields = "__all__"

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Profile
        fields = "__all__"

# Category Serializer
class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = api_models.Category
        fields = ["id", "title", "image", "slug", "post_count"]

    def get_post_count(self, category):
        return category.posts.count()

# Comment Serializer
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Comment
        fields = "__all__"

# Post Serializer
class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    attendees = UserSerializer(many=True, read_only=True) 
    attendees_count = serializers.SerializerMethodField()
    
    class Meta:
        model = api_models.Post
        fields = "__all__"

    def get_attendees_count(self, obj):
        return obj.attendees.count()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        # If it's a POST request, it does not include the related fields (like profile) in the response.
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 1

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Making sure that the profile data is included in the response even if it's not included in the POST request.
        if not data.get("profile") and getattr(instance, "user", None):
            try:
                data["profile"] = ProfileSerializer(instance.user.profile, context=self.context).data
            except api_models.Profile.DoesNotExist:
                pass
        return data

# Bookmark and Notification Serializers
class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Bookmark
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 1 

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Notification
        fields = "__all__"
        depth = 1

# User Stats Serializer
class UserStatsSerializer(serializers.Serializer):
    views = serializers.IntegerField(default=0)
    posts = serializers.IntegerField(default=0)
    likes = serializers.IntegerField(default=0)
    bookmarks = serializers.IntegerField(default=0)