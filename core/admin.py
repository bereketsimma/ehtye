from django.contrib import admin

from .models import Lesson, Parent, Review, Student, Tutor


@admin.register(Tutor)
class TutorAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "national_id", "email", "created_at")
    search_fields = ("first_name", "last_name", "national_id", "email")
    list_filter = ("created_at",)


@admin.register(Parent)
class ParentAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "national_id", "email", "created_at")
    search_fields = ("first_name", "last_name", "national_id", "email")
    list_filter = ("created_at",)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "parent", "created_at")
    search_fields = ("first_name", "last_name")
    list_filter = ("created_at",)


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("subject", "tutor", "student", "status", "scheduled_at", "created_at")
    search_fields = ("subject", "tutor__first_name", "student__first_name")
    list_filter = ("status", "scheduled_at")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("lesson", "parent", "rating", "created_at")
    search_fields = ("lesson__subject", "parent__first_name")
    list_filter = ("rating", "created_at")
