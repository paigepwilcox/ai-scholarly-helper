from django.urls import path
# from . import views
from .views import Analyze

urlpatterns = [
    path('analyze/', Analyze.as_view(), name='analyze')
]