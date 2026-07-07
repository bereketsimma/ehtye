from django.http import HttpResponse
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'core'

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'students', views.StudentViewSet, basename='student')
router.register(r'lessons', views.LessonViewSet, basename='lesson')

urlpatterns = [
    path('', lambda request: HttpResponse("<h1>Welcome to Ehtye</h1><p>Go to <a href='/admin/'>/admin/</a> or use the <a href='/api/'>API</a>.</p>"), name='home'),
    path('api/auth/register/', views.register, name='register'),
    path('api/auth/login/', views.login, name='login'),
    path('api/tutor/courses/', views.TutorCoursesViewSet.as_view({'get': 'list', 'post': 'create'}), name='tutor-courses'),
    path('api/tutor/courses/<int:pk>/', views.TutorCoursesViewSet.as_view({'delete': 'destroy'}), name='tutor-courses-detail'),
    path('api/', include(router.urls)),
]
