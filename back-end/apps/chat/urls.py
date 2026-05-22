from django.urls import path
from .views import (
    StartConversationView, MyConversationsView,
    ConversationDetailView, MarkMessagesReadView,
    StartConversationWithUserView
)

urlpatterns = [
    path('start/<int:donation_id>/', StartConversationView.as_view(), name='start_conversation'),
    path('start-direct/<int:user_id>/', StartConversationWithUserView.as_view(), name='start_direct_chat'),
    path('my-conversations/', MyConversationsView.as_view(), name='my_conversations'),
    path('<int:conversation_id>/', ConversationDetailView.as_view(), name='conversation_detail'),
    path('<int:conversation_id>/read/', MarkMessagesReadView.as_view(), name='mark_read'),
]