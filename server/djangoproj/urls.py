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
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from django.views.generic import RedirectView
from django.http import JsonResponse

# Simple health check view for monitoring
def health_check(request):
    return JsonResponse({
        "status": "healthy",
        "service": "django_main",
        "version": "1.0"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('djangoapp/', include('djangoapp.urls')),
    # Add a health check endpoint
    path('health/', health_check, name='health_check'),
    # Redirect root to djangoapp
    path('', RedirectView.as_view(url='/djangoapp/', permanent=False)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve React static files in production
if not settings.DEBUG:
    from django.views.static import serve
    from django.urls import re_path
    
    # Serve React build static files
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve, {
            'document_root': settings.STATIC_ROOT,
        }),
    ]
