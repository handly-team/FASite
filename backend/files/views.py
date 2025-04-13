from rest_framework import generics
from .serializers import FileListSerializer, CategorySerializer, TagSerializer, FileCreateSerializer
from .models import File, Category, Tag
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from rest_framework.decorators import api_view
from io import BytesIO
import zipfile
from django.conf import settings
import os
from django.http import JsonResponse

class FileListView(generics.ListAPIView):
    queryset = File.objects.all()
    serializer_class = FileListSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        user = self.request.user
        queryset = File.objects.filter(
            Q(owner=user) |
            Q(can_view_users=user)
        ).distinct()

        query = self.request.query_params.get('search', None)
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(category__name__icontains=query) |
                Q(tags__name__icontains=query)
            ).distinct()

        return queryset

class FileCreateView(generics.CreateAPIView):
    queryset = File.objects.all()
    serializer_class = FileCreateSerializer


class FileUpdateView(generics.UpdateAPIView):
    queryset = File.objects.all()
    serializer_class = FileCreateSerializer  # Можно сделать отдельный update-сериализатор, если нужно

    def get_object(self):
        file = super().get_object()
        user = self.request.user
        if file.owner != user and user not in file.can_edit_users.all():
            raise PermissionDenied("У вас нет прав на редактирование этого файла.")
        return file
    
class FileDeleteView(generics.DestroyAPIView):
    queryset = File.objects.all()

    def get_object(self):
        file = super().get_object()
        user = self.request.user
        if file.owner != user and user not in file.can_delete_users.all():
            raise PermissionDenied("У вас нет прав на удаление этого файла.")
        return file    

class CategoryView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class TagView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

@api_view(['POST'])
def archive_files(request):
    # Получаем ID файлов для архивации
    file_ids = request.data.get('file_ids', [])
    files = File.objects.filter(id__in=file_ids)

    # Создаем архив в памяти
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as archive:
        for file in files:
            file_path = os.path.join(settings.MEDIA_ROOT, file.file.name)
            archive.write(file_path, os.path.basename(file.file.name))

    # Сохраняем архив на сервере или возвращаем его в ответе
    zip_buffer.seek(0)  # Сбрасываем указатель на начало
    file_name = 'files_archive.zip'
    archive_path = os.path.join(settings.MEDIA_ROOT, file_name)
    
    with open(archive_path, 'wb') as f:
        f.write(zip_buffer.read())

    # Возвращаем ссылку на скачивание архива
    archive_url = f"{settings.MEDIA_URL}{file_name}"
    return JsonResponse({'archive_url': archive_url})