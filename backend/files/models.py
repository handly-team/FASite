from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()
    
class File(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='uploads/')
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.ManyToManyField('Tag', blank=True)

    can_view_users = models.ManyToManyField(User, related_name='can_view_files', blank=True)
    can_edit_users = models.ManyToManyField(User, related_name='can_edit_files', blank=True)
    can_delete_users = models.ManyToManyField(User, related_name='can_delete_files', blank=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

