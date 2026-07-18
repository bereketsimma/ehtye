from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Course, Lesson, Review, Student
from .permissions import (
    IsParent,
    IsParentOfLessonStudent,
    IsParentOfStudent,
    IsReviewParent,
    IsTutor,
    IsTutorOfLesson,
)
from .serializers import (
    CourseSerializer,
    LessonSerializer,
    RegisterSerializer,
    ReviewSerializer,
    StudentSerializer,
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        result = serializer.save()
        return Response({
            'user': {
                'id': result['user'].id,
                'username': result['user'].username,
            },
            'token': result['token'],
            'role': result['role'],
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)
        role = None
        if hasattr(user, 'tutor_profile'):
            role = 'tutor'
        elif hasattr(user, 'parent_profile'):
            role = 'parent'
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'role': role,
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CourseSerializer
    queryset = Course.objects.all()
    permission_classes = [IsAuthenticated]


class TutorCoursesViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsTutor]

    def list(self, request):
        tutor = request.user.tutor_profile
        serializer = CourseSerializer(tutor.courses.all(), many=True)
        return Response(serializer.data)

    def create(self, request):
        course_id = request.data.get('course_id')
        try:
            course = Course.objects.get(course_id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)
        tutor = request.user.tutor_profile
        tutor.courses.add(course)
        return Response({'status': f'Added {course.course_name}'})

    def destroy(self, request, pk=None):
        tutor = request.user.tutor_profile
        course = get_object_or_404(Course, pk=pk)
        tutor.courses.remove(course)
        return Response({'status': f'Removed {course.course_name}'})


class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'parent_profile'):
            return Student.objects.filter(parent=user.parent_profile)
        if hasattr(user, 'tutor_profile'):
            if self.request.query_params.get('all'):
                return Student.objects.all()
            return Student.objects.filter(lessons__tutor=user.tutor_profile).distinct()
        return Student.objects.none()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsParent()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user.parent_profile)


class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'tutor_profile'):
            return Lesson.objects.filter(tutor=user.tutor_profile)
        if hasattr(user, 'parent_profile'):
            return Lesson.objects.filter(student__parent=user.parent_profile)
        return Lesson.objects.none()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsTutor()]
        if self.action in ('start', 'end', 'cancel'):
            return [IsAuthenticated(), IsTutor(), IsTutorOfLesson()]
        if self.action in ('retrieve', 'review'):
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(tutor=self.request.user.tutor_profile)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        lesson = self.get_object()
        if lesson.tutor != request.user.tutor_profile:
            return Response({'error': 'You are not the tutor of this lesson.'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            lesson.start()
            return Response({'status': 'Lesson started'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        lesson = self.get_object()
        if lesson.tutor != request.user.tutor_profile:
            return Response({'error': 'You are not the tutor of this lesson.'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            lesson.end()
            return Response({'status': 'Lesson completed'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        lesson = self.get_object()
        if lesson.tutor != request.user.tutor_profile:
            return Response({'error': 'You are not the tutor of this lesson.'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            lesson.cancel()
            return Response({'status': 'Lesson cancelled'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post', 'put'])
    def review(self, request, pk=None):
        lesson = self.get_object()

        if request.method == 'GET':
            try:
                review = Review.objects.get(lesson=lesson)
                serializer = ReviewSerializer(review, context={'request': request, 'lesson': lesson})
                return Response(serializer.data)
            except Review.DoesNotExist:
                return Response({'detail': 'No review yet.'}, status=status.HTTP_404_NOT_FOUND)

        if not hasattr(request.user, 'parent_profile'):
            return Response({'error': 'Only parents can review lessons.'},
                            status=status.HTTP_403_FORBIDDEN)

        if lesson.student.parent != request.user.parent_profile:
            return Response({'error': 'You can only review lessons for your own children.'},
                            status=status.HTTP_403_FORBIDDEN)

        if request.method == 'POST':
            serializer = ReviewSerializer(
                data=request.data,
                context={'request': request, 'lesson': lesson},
            )
            if serializer.is_valid():
                serializer.save(lesson=lesson, parent=request.user.parent_profile)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if request.method == 'PUT':
            try:
                review = Review.objects.get(lesson=lesson)
            except Review.DoesNotExist:
                return Response({'detail': 'No review found.'}, status=status.HTTP_404_NOT_FOUND)

            if review.parent != request.user.parent_profile:
                return Response({'error': 'You can only edit your own review.'},
                                status=status.HTTP_403_FORBIDDEN)

            serializer = ReviewSerializer(
                review,
                data=request.data,
                partial=False,
                context={'request': request, 'lesson': lesson},
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
