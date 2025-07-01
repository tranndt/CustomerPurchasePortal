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

    # Customer endpoints
    path("api/customer/orders", views.get_customer_orders),
    path("api/customer/reviews", views.get_customer_reviews),
    path("api/customer/tickets", views.get_customer_tickets),
    path("api/customer/review", views.post_review),
    path("api/customer/support/new", views.submit_support_ticket),
    
    # Admin endpoints
    path("api/admin/orders", views.get_all_orders),
    path("api/admin/reviews", views.get_all_reviews),
    path("api/admin/tickets", views.get_support_tickets),
    path("api/admin/tickets/<int:ticket_id>", views.get_ticket_detail),
    path("api/admin/tickets/<int:ticket_id>/update", views.update_ticket_detail),
    
    # Support role endpoints
    path("api/support/tickets", views.get_support_tickets),
    path("api/support/tickets/<int:ticket_id>", views.get_ticket_detail),
    path("api/support/tickets/<int:ticket_id>/update", views.update_ticket_detail),
    
    # Utility endpoints
    path("api/order-by-transaction/<str:transaction_id>", views.get_order_by_transaction),
    path("api/demo-users", views.get_demo_users),
    path("api/init-demo-data", views.init_demo_data),


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
