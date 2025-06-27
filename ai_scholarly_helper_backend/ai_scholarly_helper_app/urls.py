from django.urls import path
# from . import views
from .views import Analyze, AnalyzeLanguage, AnalyzeMethodology, AnalyzeWithQuestions

urlpatterns = [
    path('analyze/', Analyze.as_view(), name='analyze'),
    path('language/', AnalyzeLanguage.as_view(), name='language'),
    path('methodology/', AnalyzeMethodology.as_view(), name='methodology'),
    path('analyze/questions/', AnalyzeWithQuestions.as_view(), name='analyze-with-questions')
]