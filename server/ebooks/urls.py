from django.urls import path
from .views import ebook_detail_view, ebook_download_view, ebook_upload_view


app_name = 'ebooks'
urlpatterns = [
    path('<str:uuid>/', ebook_detail_view, name='ebook-detail'),
    path('<str:uuid>/download/', ebook_download_view, name='ebook-download'),
    path('upload/', ebook_upload_view, name='ebook-upload')
]
