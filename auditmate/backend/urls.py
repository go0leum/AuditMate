"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import (
    list_files, list_rules, download_file, upload_files, read_xlsx, save_xlsx, download_rule_zip,
    save_rule, update_rule_name, delete_file, delete_rule, read_contact_info
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/files/', list_files, name='list_files'),
    path('api/rules/', list_rules, name='list_rules'),
    path("api/download/<str:folder_name>/<str:file_name>/", download_file, name="download_file"),
    path('api/upload/', upload_files, name='upload_files'), 
    path('api/read-xlsx/', read_xlsx, name='read_xlsx'),
    path('api/save-xlsx/', save_xlsx, name='save_xlsx'),
    path('api/download_rule/<str:folder_name>/', download_rule_zip, name='download_rule_zip'),
    path('api/save_rule/', save_rule, name='save_rule'),
    path('api/update_rule_name/', update_rule_name, name='update_rule_name'),
    path('api/delete_file/<str:folder_name>/', delete_file, name='delete_file'),
    path('api/delete_rule/<str:rule_name>/', delete_rule, name='delete_rule'),
    path("api/read_contact_info/", read_contact_info, name="read_contact_info"),
]