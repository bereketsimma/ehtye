from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import Lesson, Parent, Review, Student, Tutor


class RegisterSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['tutor', 'parent'])
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    national_id = serializers.CharField()
    email = serializers.EmailField()
    document = serializers.FileField(required=False)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role')
        document = validated_data.pop('document', None)
        user = User.objects.create_user(
            username=validated_data.pop('username'),
            password=validated_data.pop('password'),
        )
        if role == 'tutor':
            profile = Tutor.objects.create(
                user=user,
                document=document,
                **validated_data
            )
        else:
            profile = Parent.objects.create(
                user=user,
                **validated_data
            )
        token, _ = Token.objects.get_or_create(user=user)
        return {'user': user, 'profile': profile, 'token': token.key, 'role': role}


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'first_name', 'last_name', 'parent', 'created_at', 'updated_at']
        read_only_fields = ['parent', 'created_at', 'updated_at']

    def validate_parent(self, value):
        request = self.context.get('request')
        if request and hasattr(request.user, 'parent_profile'):
            if value != request.user.parent_profile:
                raise serializers.ValidationError("You can only create students under your own profile.")
        return value


class LessonSerializer(serializers.ModelSerializer):
    tutor_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'tutor', 'tutor_name', 'student', 'student_name',
            'subject', 'scheduled_at', 'started_at', 'ended_at',
            'status', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['tutor', 'started_at', 'ended_at', 'status', 'created_at', 'updated_at']

    def get_tutor_name(self, obj):
        return str(obj.tutor)

    def get_student_name(self, obj):
        return str(obj.student)

    def validate_student(self, value):
        request = self.context.get('request')
        if request and hasattr(request.user, 'tutor_profile'):
            pass
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['tutor'] = request.user.tutor_profile
        return super().create(validated_data)


class LessonStartSerializer(serializers.Serializer):
    def validate(self, data):
        lesson = self.context.get('lesson')
        if lesson.status != Lesson.Status.SCHEDULED:
            raise serializers.ValidationError("Only scheduled lessons can be started.")
        return data


class LessonEndSerializer(serializers.Serializer):
    def validate(self, data):
        lesson = self.context.get('lesson')
        if lesson.status != Lesson.Status.IN_PROGRESS:
            raise serializers.ValidationError("Only in-progress lessons can be ended.")
        return data


class LessonCancelSerializer(serializers.Serializer):
    def validate(self, data):
        lesson = self.context.get('lesson')
        if lesson.status in (Lesson.Status.COMPLETED, Lesson.Status.CANCELLED):
            raise serializers.ValidationError(
                "Cannot cancel a completed or already cancelled lesson."
            )
        return data


class ReviewSerializer(serializers.ModelSerializer):
    parent_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'lesson', 'parent', 'parent_name', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['lesson', 'parent', 'created_at', 'updated_at']

    def get_parent_name(self, obj):
        return str(obj.parent)

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, data):
        request = self.context.get('request')
        lesson = self.context.get('lesson')

        if not lesson:
            raise serializers.ValidationError("Lesson is required.")

        if lesson.status != Lesson.Status.COMPLETED:
            raise serializers.ValidationError("Can only review completed lessons.")

        if not hasattr(request.user, 'parent_profile'):
            raise serializers.ValidationError("Only parents can review lessons.")

        parent = request.user.parent_profile
        if lesson.student.parent != parent:
            raise serializers.ValidationError(
                "You can only review lessons for your own children."
            )

        if lesson.ended_at:
            if timezone.now() - lesson.ended_at > timedelta(days=7):
                raise serializers.ValidationError(
                    "Review period has expired. Reviews must be submitted within 7 days of lesson completion."
                )

        if Review.objects.filter(lesson=lesson).exists() and self.instance is None:
            raise serializers.ValidationError("This lesson has already been reviewed.")

        data['parent'] = parent
        return data
