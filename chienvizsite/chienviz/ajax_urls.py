from django.urls import path

from . import views

urlpatterns = [
    path('', views.get_train_info, name='get-train-info'),
]
