from django.urls import path
from .views import FileListView, TagView, CategoryView, FileCreateView, archive_files, FileDeleteView, FileUpdateView

urlpatterns = [
    path('files/', FileListView.as_view(), name='files'),
    path('files/create/', FileCreateView.as_view(), name='files_create'),
    path('tags/', TagView.as_view(), name='tags'),
    path('categories/', CategoryView.as_view(), name='categories'),
    path('archive/', archive_files, name='archive_files'),
    path('files/<int:pk>/delete/', FileDeleteView.as_view(), name='file-delete'),
    path('files/<int:pk>/edit/', FileUpdateView.as_view(), name='file-update'),
]
