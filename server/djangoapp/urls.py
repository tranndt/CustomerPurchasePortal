# Uncomment the imports before you add the code
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views

app_name = 'djangoapp'
urlpatterns = [
    # path for registration
    # path(route='register', view=views.registration, name='register'),

    # path for login
    path(route='login', view=views.login_user, name='login'),
    path(route='logout', view=views.logout_user, name='logout'),
    path(route='register', view=views.register_user, name='register'),

    # path for dealer reviews view
    # path(route='get_dealers', view=views.get_dealerships, name='get_dealers'),
    # path(route='get_dealers/<str:state>', view=views.get_dealerships, name='get_dealers_by_state'),
    # path(route='reviews/dealer/<int:dealer_id>', view=views.get_dealer_reviews, name='dealer_reviews'),
    # path(route='get_dealer/<int:dealer_id>', view=views.get_dealer_details, name='dealer_details'),
    # path(route='get_cars', view=views.get_cars, name='get_cars'),
    # path(route='add_review', view=views.add_review, name='add_review'),

    path("api/myorders", views.get_my_orders),
    path("api/review", views.post_review),
    path("api/support", views.submit_support_ticket),
    path("api/allorders", views.get_all_orders),
    path("api/tickets", views.get_support_tickets),
    path("api/tickets/<int:ticket_id>", views.update_ticket_status),
    path("api/demo-users", views.get_demo_users),


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
