from rest_framework.permissions import BasePermission


class IsTutor(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'tutor_profile')


class IsParent(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'parent_profile')


class IsTutorOfLesson(BasePermission):
    def has_object_permission(self, request, view, obj):
        return hasattr(request.user, 'tutor_profile') and obj.tutor == request.user.tutor_profile


class IsParentOfLessonStudent(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            hasattr(request.user, 'parent_profile')
            and obj.student.parent == request.user.parent_profile
        )


class IsReviewParent(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            hasattr(request.user, 'parent_profile')
            and obj.parent == request.user.parent_profile
        )


class IsParentOfStudent(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            hasattr(request.user, 'parent_profile')
            and obj.parent == request.user.parent_profile
        )
