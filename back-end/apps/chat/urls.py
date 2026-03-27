from django.urls import path
from .views import StartConversationView, MyConversationsView, ConversationDetailView

urlpatterns = [
    path('start/<int:donation_id>/', StartConversationView.as_view(), name='start_conversation'),
    path('my-conversations/', MyConversationsView.as_view(), name='my_conversations'),
    path('<int:conversation_id>/', ConversationDetailView.as_view(), name='conversation_detail'),
]