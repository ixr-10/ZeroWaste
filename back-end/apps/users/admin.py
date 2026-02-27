from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'is_verified', 'reputation_score', 'created_at']
    list_filter = ['role', 'is_verified']
    search_fields = ['username', 'email']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('role', 'phone', 'address', 'reputation_score', 'is_verified', 'avatar')}),
    )