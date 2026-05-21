from django.http import HttpResponse


def home(request):
    return HttpResponse(
        """
        <h1>Welcome to Ehtye</h1>
        <p>This platform connects tutors and students for remote learning.</p>
        <p>Go to <a href="/admin/">/admin/</a> to manage tutors.</p>
        """
    )
