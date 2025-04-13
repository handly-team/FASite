from rest_framework import serializers
from .models import File, Category, Tag
from django.contrib.auth import get_user_model

User = get_user_model()

# Сериализатор пользователя
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

# Сериализатор категории
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

# Сериализатор тега
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class FileCreateSerializer(serializers.ModelSerializer):
    can_view_users = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, required=False)
    can_edit_users = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, required=False)
    can_delete_users = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, required=False)

    class Meta:
        model = File
        fields = [
            'id', 'owner', 'name', 'description', 'file',
            'category', 'tags',
            'can_view_users', 'can_edit_users', 'can_delete_users'
        ]

class FileListSerializer(serializers.ModelSerializer):
    owner = UserSerializer()
    category = CategorySerializer()
    tags = TagSerializer(many=True)
    
    class Meta:
        model = File
        fields = '__all__'
