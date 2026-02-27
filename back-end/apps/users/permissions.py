from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class Isdonateur(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'donateur'

class IsBeneficiaire(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'beneficiaire'

class IsFoodSaver(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'food_saver'

class IsCollectivite(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'collectivite'