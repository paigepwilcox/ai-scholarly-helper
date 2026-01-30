from django.urls import path
from .views import AnalyzeWithQuestions, AnalyzeLanguage, AnalyzeMethodology, ActiveReadingQuestions

urlpatterns = [
    path('analyze/questions/', AnalyzeWithQuestions.as_view(), name='analyze'),
    path('language/', AnalyzeLanguage.as_view(), name='language'),
    path('methodology/', AnalyzeMethodology.as_view(), name='methodology'),
    path('questions/', ActiveReadingQuestions.as_view(), name='analyze-with-questions')
]