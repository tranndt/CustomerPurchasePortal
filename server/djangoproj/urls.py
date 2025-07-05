"""djangoproj URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf.urls.static import static
from django.conf import settings
from django.views.generic import RedirectView
from django.http import JsonResponse
from djangoapp.views import home

# Simple health check view for monitoring
def health_check(request):
    return JsonResponse({
        "status": "healthy",
        "service": "django_main",
        "version": "1.0"
    })

def debug_test(request):
    return JsonResponse({
        "message": "DJANGO IS RESPONDING",
        "service": "django", 
        "timestamp": str(__import__('datetime').datetime.now()),
        "port": "Django on main port"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('djangoapp/', include('djangoapp.urls')),
    # Add a health check endpoint
    path('health/', health_check, name='health_check'),
    # Add a debug test endpoint
    path('debug-test/', debug_test, name='debug_test'),
    # Serve React frontend at root
    path('', home, name='home'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve static files and React build assets
from django.views.static import serve

# Serve React build static files (CSS, JS)
urlpatterns += [
    re_path(r'^static/(?P<path>.*)$', serve, {
        'document_root': settings.STATIC_ROOT,
    }),
]

# Serve React build root assets (favicon, manifest, etc.)
urlpatterns += [
    re_path(r'^favicon\.ico$', serve, {
        'document_root': settings.REACT_BUILD_DIR,
        'path': 'favicon.ico',
    }),
    re_path(r'^logo192\.png$', serve, {
        'document_root': settings.REACT_BUILD_DIR,
        'path': 'logo192.png',
    }),
    re_path(r'^logo512\.png$', serve, {
        'document_root': settings.REACT_BUILD_DIR,
        'path': 'logo512.png',
    }),
    re_path(r'^customer-dashboard\.png$', serve, {
        'document_root': settings.REACT_BUILD_DIR,
        'path': 'customer-dashboard.png',
    }),
    re_path(r'^manifest\.json$', serve, {
        'document_root': settings.REACT_BUILD_DIR,
        'path': 'manifest.json',
    }),
    re_path(r'^robots\.txt$', serve, {
        'document_root': settings.REACT_BUILD_DIR,
        'path': 'robots.txt',
    }),
]

# Catch-all pattern for React routing (should be last)
# This serves index.html for any route that doesn't match above patterns
# Important: This should be after all API routes
urlpatterns += [
    re_path(r'^(?!admin|djangoapp|health|static|favicon|logo|manifest|robots|customer-dashboard).*$', home, name='react_app'),
]
