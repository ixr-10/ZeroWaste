from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsFoodSaver(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'food_saver' and
            request.user.is_verified
        )

class IsCollectivite(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'localauthority'

class IsAdminOrFoodSaver(BasePermission):
   
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        if user.role == 'admin':
            return True
        if user.role == 'food_saver' and user.is_verified:
            return True
        return False