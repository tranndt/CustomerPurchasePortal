# Uncomment the imports before you add the code
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views

app_name = 'djangoapp'
urlpatterns = [
    # Home page - serve React app or API info
    path(route='', view=views.home, name='home'),
    
    # Health check endpoint
    path(route='health-check', view=views.health_check, name='health_check'),
    
    # Debug endpoint for production troubleshooting
    path(route='debug-filesystem', view=views.debug_filesystem, name='debug_filesystem'),

    # path for registration
    # path(route='register', view=views.registration, name='register'),

    # path for login
    path(route='login', view=views.login_user, name='login'),
    path(route='logout', view=views.logout_user, name='logout'),
    path(route='register', view=views.register_user, name='register'),

    # Customer endpoints
    path("api/customer/orders", views.get_customer_orders),
    path("api/customer/reviews", views.get_customer_reviews),
    path("api/customer/tickets", views.get_customer_tickets),
    path("api/customer/review", views.post_review),  # Legacy product-specific review
    path("api/customer/review/experience", views.post_experience_review),  # New shopping experience review
    path("api/reviews/public", views.get_public_reviews),  # Public reviews for all customers to see
    path("api/customer/support/new", views.submit_support_ticket),
    
    # Admin endpoints
    path("api/admin/orders", views.get_all_orders),
    path("api/admin/reviews", views.get_reviews_for_management),
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
    
    # Product endpoints
    path("api/products", views.get_products, name='get_products'),
    path("api/products/<int:product_id>", views.get_product_detail, name='get_product_detail'),
    path("api/products/categories", views.get_product_categories, name='get_categories'),
    
    # Cart endpoints
    path("api/cart", views.get_cart, name='get_cart'),
    path("api/cart/add", views.cart_add_item, name='cart_add'),
    path("api/cart/update", views.cart_update_item, name='cart_update'),
    path("api/cart/remove", views.cart_remove_item, name='cart_remove'),
    path("api/cart/checkout", views.cart_checkout, name='cart_checkout'),
    
    # Order Fulfillment & Inventory Management endpoints (Manager/Admin only)
    path("api/manager/orders/pending", views.get_pending_orders, name='get_pending_orders'),
    path("api/manager/orders/all", views.get_all_orders_for_management, name='get_all_orders_management'),
    path("api/manager/orders/process", views.process_order, name='process_order'),
    path("api/manager/inventory", views.get_inventory_overview, name='get_inventory'),
    path("api/manager/reviews", views.get_reviews_for_management, name='get_reviews_management'),
    path("api/manager/tickets", views.get_tickets_for_management, name='get_tickets_management'),


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
