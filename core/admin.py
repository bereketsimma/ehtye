from django.contrib import admin

from .models import Tutor


@admin.register(Tutor)
class TutorAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "national_id", "email", "created_at")
    search_fields = ("first_name", "last_name", "national_id", "email")
    list_filter = ("created_at",)
