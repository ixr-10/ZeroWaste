from django.urls import path
from .views import (
    CreateReportView,
    ListReportsView,
    ReportDetailView,      
    ReportActionView,
    ToggleUserActiveView,
)

urlpatterns = [
    path('report/', CreateReportView.as_view()),
    path('reports/', ListReportsView.as_view()),
    path('reports/<int:pk>/', ReportDetailView.as_view()),         
    path('reports/<int:pk>/action/', ReportActionView.as_view()),
    path('users/<int:user_id>/toggle-active/', ToggleUserActiveView.as_view()),
]