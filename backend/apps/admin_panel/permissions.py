from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """Only allow admin users (is_staff=True)."""
    message = 'Admin access required.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsSuperAdmin(BasePermission):
    """Only allow superusers."""
    message = 'Super admin access required.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)
