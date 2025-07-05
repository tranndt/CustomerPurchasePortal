# Required imports for the views

from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.db import connection
from django.db.models import Sum
from django.core.management import call_command
from datetime import datetime
import logging
import json
import traceback

from .restapis import get_request, analyze_review_sentiments, post_review
from .models import UserProfile, Product, Order, Review, SupportTicket, CartItem

# Get an instance of a logger
logger = logging.getLogger(__name__)

# Health check for Render deployment
def health_check(request):
    """
    Basic health check endpoint for monitoring service availability.
    Used by Render for health checks.
    """
    return JsonResponse({'status': 'ok', 'message': 'Service is healthy'})

# Home view to serve the React application
def home(request):
    """
    Serve the React frontend application.
    This acts as the main entry point for the web application.
    """
    from django.conf import settings
    import os
    
    # Add explicit debug logging
    print(f"HOME VIEW CALLED - Request path: {request.path}")
    print(f"HOME VIEW CALLED - Method: {request.method}")
    print(f"HOME VIEW CALLED - Headers: {dict(request.headers)}")
    
    # Path to React build index.html
    react_index_path = os.path.join(settings.BASE_DIR, 'frontend', 'build', 'index.html')
    print(f"HOME VIEW - Looking for React build at: {react_index_path}")
    print(f"HOME VIEW - React build exists: {os.path.exists(react_index_path)}")
    
    try:
        # Try to serve the React index.html file
        if os.path.exists(react_index_path):
            with open(react_index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            print("HOME VIEW - Successfully serving React build")
            return HttpResponse(content, content_type='text/html')
        else:
            # Fallback if React build doesn't exist
            print("HOME VIEW - React build not found, serving API response")
            return JsonResponse({
                'message': 'ElectronicsRetail API is running',
                'status': 'success',
                'service': 'django',
                'error': 'React build not found',
                'path_checked': react_index_path,
                'endpoints': {
                    'admin': '/admin/',
                    'api': '/djangoapp/api/',
                    'auth': '/djangoapp/login',
                    'health': '/health/'
                }
            })
    except Exception as e:
        # Error fallback
        print(f"HOME VIEW - Exception occurred: {e}")
        return JsonResponse({
            'message': 'ElectronicsRetail API is running',
            'status': 'error',
            'service': 'django',
            'error': str(e),
            'endpoints': {
                'admin': '/admin/',
                'api': '/djangoapp/api/',
                'auth': '/djangoapp/login',
                'health': '/health/'
            }
        })

# Create a `login_request` view to handle sign in request
@csrf_exempt
def login_user(request):
    if request.method == "POST":
        try:
            # Get username and password from request.POST dictionary
            data = json.loads(request.body)
            username = data['userName']
            password = data['password']
            # Try to check if provide credential can be authenticated
            user = authenticate(username=username, password=password)
            if user is not None:
                # If user is valid, call login method to login current user
                login(request, user)
                
                # Get user role from profile
                try:
                    profile = UserProfile.objects.get(user=user)
                    user_role = profile.get_role_display()  # This returns the display value (e.g., "Manager")
                except UserProfile.DoesNotExist:
                    user_role = "Customer"
                
                return JsonResponse({
                    "status": 200, 
                    "userName": username,
                    "firstName": user.first_name,
                    "lastName": user.last_name,
                    "userRole": user_role,
                    "message": "Authenticated"
                })
            else:
                return JsonResponse({"status": 401, "userName": username, "message": "Authentication failed"})
        except Exception as e:
            return JsonResponse({"status": 400, "error": "Login failed", "message": str(e)})
    else:
        return JsonResponse({"status": 405, "error": "Method not allowed", "message": "Only POST method is supported"})

# Create a `logout_request` view to handle sign out request
def logout_user(request):
    logout(request)
    return JsonResponse({"status": 200, "userName": "", "message": "Logged out successfully"})


# Create a `registration` view to handle sign up request
# @csrf_exempt
@csrf_exempt
def register_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            if User.objects.filter(username=data["userName"]).exists():
                return JsonResponse({"status": 409, "error": "Already Registered", "message": "User already exists"})

            user = User.objects.create_user(
                username=data["userName"],
                password=data["password"],
                first_name=data["firstName"],
                last_name=data["lastName"],
                email=data["email"]
            )
            
            # Create user profile with default Customer role
            profile = UserProfile.objects.create(user=user, role="customer")
            
            login(request, user)
            return JsonResponse({
                "status": 201, 
                "userName": user.username,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "userRole": "customer",
                "message": "User registered successfully"
            })
        except Exception as e:
            return JsonResponse({"status": 400, "error": "Registration failed", "message": str(e)})
    else:
        return JsonResponse({"status": 405, "error": "Method not allowed", "message": "Only POST method is supported"})

@login_required
def get_my_orders(request):
    orders = Order.objects.filter(customer=request.user).select_related("product")
    results = [
        {
            "order_id": order.id,
            "transaction_id": order.transaction_id,
            "product": order.product.name,
            "category": order.product.category,
            "price": str(order.product.price),
            "date_purchased": order.date_purchased,
        } for order in orders
    ]
    return JsonResponse({"status": 200, "orders": results})

def get_customer_orders(request):
    orders = Order.objects.filter(customer=request.user).select_related("product").order_by('-date_purchased')
    results = [
        {
            "order_id": order.id,
            "transaction_id": order.transaction_id,
            "product": order.product.name,
            "category": order.product.category,
            "price": str(order.product.price),
            "quantity": order.quantity,
            "total_amount": str(order.total_amount),
            "date_purchased": order.date_purchased,
            "product_image": order.product.image_url,
            "product_id": order.product.id,
        } for order in orders
    ]
    return JsonResponse({"status": 200, "orders": results})

@csrf_exempt
@login_required
def post_review(request):
    if request.method == "POST":
        data = json.loads(request.body)
        product_id = data.get("product_id")
        review_text = data.get("review")
        rating = data.get("rating")

        # Skip sentiment analysis for now
        sentiment = "neutral"

        Review.objects.update_or_create(
            customer=request.user,
            product_id=product_id,
            defaults={
                "review_text": review_text,
                "rating": rating,
                "sentiment": sentiment
            }
        )
        return JsonResponse({"status": 200, "message": "Review posted."})

@csrf_exempt
@login_required
def submit_support_ticket(request):
    # Accept POST to /api/support/new only
    if request.method == "POST":
        data = request.POST
        product_id = data.get("product_id")
        order_id = data.get("order_id")
        issue = data.get("issue_description")
        file = request.FILES.get("attachment")

        SupportTicket.objects.create(
            customer=request.user,
            product_id=product_id,
            order_id=order_id,
            issue_description=issue,
            attachment=file
        )
        return JsonResponse({"status": 200, "message": "Support ticket submitted."})
    else:
        return JsonResponse({"status": 405, "error": "Method not allowed", "message": "Only POST method is supported"})

@login_required
def get_all_orders(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.role.lower() not in ["manager", "admin"]:
            return JsonResponse({"status": 403, "message": "Access denied"})
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": 403, "message": "Access denied"})

    orders = Order.objects.select_related("customer", "product")
    results = [
        {
            "customer": order.customer.username,
            "product": order.product.name,
            "transaction_id": order.transaction_id,
            "date": order.date_purchased,
        } for order in orders
    ]
    return JsonResponse({"status": 200, "orders": results})

@login_required
def get_support_tickets(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.role.lower() not in ["manager", "admin", "support"]:
            return JsonResponse({"status": 403, "message": "Access denied"})
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": 403, "message": "Access denied"})

    tickets = SupportTicket.objects.select_related("customer", "product")
    results = [
        {
            "ticket_id": t.id,
            "customer": t.customer.username,
            "product": t.product.name,
            "status": t.status,
            "submitted": t.submitted_on,
            "issue": t.issue_description,
            "attachment": t.attachment.url if t.attachment else None,
        } for t in tickets
    ]
    return JsonResponse({"status": 200, "tickets": results})


@csrf_exempt
@login_required
def update_ticket_status(request, ticket_id):
    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.role.lower() not in ["manager", "admin", "support"]:
            return JsonResponse({"status": 403})
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": 403})

    if request.method == "POST":
        data = json.loads(request.body)
        status = data.get("status")
        note = data.get("resolution_note", "")

        SupportTicket.objects.filter(id=ticket_id).update(
            status=status, resolution_note=note
        )
        return JsonResponse({"status": 200, "message": "Updated successfully"})
    
# Create a `get_demo_users` view to provide sample users for demo login
def get_demo_users(request):
    if request.method == "GET":
        try:
            # Get only the 3 specific demo users
            demo_usernames = ['demo_customer', 'demo_admin', 'demo_support']
            users = User.objects.filter(username__in=demo_usernames)
            
            # If no demo users exist, create them
            if not users.exists():
                try:
                    from .populate import initiate
                    initiate()
                    # Re-fetch users after initialization
                    users = User.objects.filter(username__in=demo_usernames)
                except Exception as init_error:
                    # If initialization fails, return default demo users
                    return JsonResponse({
                        "status": 200, 
                        "users": [
                            {
                                'username': 'demo_customer',
                                'first_name': 'Demo',
                                'last_name': 'Customer',
                                'role': 'Customer'
                            },
                            {
                                'username': 'demo_admin',
                                'first_name': 'Demo',
                                'last_name': 'Admin', 
                                'role': 'Admin'
                            },
                            {
                                'username': 'demo_support',
                                'first_name': 'Demo',
                                'last_name': 'Support',
                                'role': 'Support'
                            }
                        ]
                    })
            
            demo_users = []
            for user in users:
                try:
                    profile = UserProfile.objects.get(user=user)
                    # Convert database role to display format
                    role_display = profile.get_role_display()
                    demo_users.append({
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': role_display
                    })
                except UserProfile.DoesNotExist:
                    demo_users.append({
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': 'Customer'
                    })
            return JsonResponse({"status": 200, "users": demo_users})
        except Exception as e:
            # Return default demo users if anything fails
            return JsonResponse({
                "status": 200, 
                "users": [
                    {
                        'username': 'demo_customer',
                        'first_name': 'Demo',
                        'last_name': 'Customer',
                        'role': 'Customer'
                    },
                    {
                        'username': 'demo_admin',
                        'first_name': 'Demo',
                        'last_name': 'Admin',
                        'role': 'Admin'
                    },
                    {
                        'username': 'demo_support',
                        'first_name': 'Demo',
                        'last_name': 'Support',
                        'role': 'Support'
                    }
                ]
            })
    else:
        return JsonResponse({"status": 405, "error": "Method not allowed", "message": "Only GET method is supported"})

# Create a `init_demo_data` view to populate demo data
def init_demo_data(request):
    if request.method == "GET":
        try:
            from .populate import initiate
            initiate()
            return JsonResponse({"status": 200, "message": "Demo data initialized successfully"})
        except Exception as e:
            return JsonResponse({"status": 500, "error": "Failed to initialize demo data", "message": str(e)})
    else:
        return JsonResponse({"status": 405, "error": "Method not allowed", "message": "Only GET method is supported"})

@require_GET
@login_required
def get_customer_reviews(request):
    if not request.user.is_authenticated:
        return JsonResponse({"status": 401, "error": "Unauthorized"}, status=401)
    reviews = Review.objects.filter(customer=request.user).order_by('-created_on')
    review_list = []
    
    for r in reviews:
        review_data = {
            'id': r.id,
            'rating': r.rating,
            'review_text': r.review_text,
            'created_on': r.created_on,
        }
        
        # Handle both old and new review formats
        if hasattr(r, 'product') and r.product:
            review_data.update({
                'product_name': r.product.name,
                'product_image': r.product.image_url if r.product.image_url else None,
                'product_id': r.product.id,
                'is_product_review': True
            })
        else:
            review_data.update({
                'is_product_review': False
            })
        
        review_list.append(review_data)
    
    return JsonResponse({"status": 200, "reviews": review_list})

from .models import SupportTicket, Product

from django.views.decorators.http import require_GET

@require_GET
def get_customer_tickets(request):
    if not request.user.is_authenticated:
        return JsonResponse({"status": 401, "error": "Unauthorized"}, status=401)
    tickets = SupportTicket.objects.filter(customer=request.user).select_related('product').order_by('-submitted_on')
    ticket_list = [
        {
            'id': t.id,
            'product_name': t.product.name,
            'status': t.status,
            'issue_description': t.issue_description,
            'submitted_on': t.submitted_on,
            'resolution_note': t.resolution_note,
        }
        for t in tickets
    ]
    return JsonResponse({"status": 200, "tickets": ticket_list})

from .models import Order

@require_GET
def get_order_by_transaction(request, transaction_id):
    if not request.user.is_authenticated:
        return JsonResponse({"status": 401, "error": "Unauthorized"}, status=401)
    try:
        order = Order.objects.select_related('product').get(transaction_id=transaction_id, customer=request.user)
        return JsonResponse({
            "status": 200,
            "order": {
                "id": order.id,
                "product_id": order.product.id,
                "product_name": order.product.name,
                "category": order.product.category,
                "price": str(order.product.price),
                "date_purchased": order.date_purchased,
            }
        })
    except Order.DoesNotExist:
        return JsonResponse({"status": 404, "error": "Order not found"}, status=404)

@require_GET
def get_all_reviews(request):
    if not request.user.is_authenticated:
        return JsonResponse({"status": 401, "error": "Unauthorized"}, status=401)
    
    # Check if user has admin or manager role
    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.role.lower() not in ['admin', 'manager']:
            return JsonResponse({"status": 403, "error": "Forbidden"}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": 403, "error": "Forbidden"}, status=403)
    
    # Get all reviews with related customer and product info
    reviews = Review.objects.select_related('customer', 'product').order_by('-created_on')
    review_list = [
        {
            'id': r.id,
            'customer_name': f"{r.customer.first_name} {r.customer.last_name}".strip() or r.customer.username,
            'product_name': r.product.name,
            'rating': r.rating,
            'review_text': r.review_text,
            'sentiment': r.sentiment,
            'created_on': r.created_on,
        }
        for r in reviews
    ]
    return JsonResponse({"status": 200, "reviews": review_list})

@require_GET
@login_required
def get_ticket_detail(request, ticket_id):
    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.role.lower() not in ["manager", "admin", "support"]:
            return JsonResponse({"status": 403, "message": "Access denied"})
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": 403, "message": "Access denied"})

    try:
        ticket = SupportTicket.objects.select_related("customer", "product").get(id=ticket_id)
        ticket_data = {
            "ticket_id": ticket.id,
            "customer": ticket.customer.username,
            "product": ticket.product.name,
            "status": ticket.status,
            "submitted": ticket.submitted_on,
            "issue": ticket.issue_description,
            "attachment": ticket.attachment.url if ticket.attachment else None,
            "resolution_note": ticket.resolution_note or ""
        }
        return JsonResponse({"status": 200, "ticket": ticket_data})
    except SupportTicket.DoesNotExist:
        return JsonResponse({"status": 404, "message": "Ticket not found"})

@csrf_exempt
@login_required
def update_ticket_detail(request, ticket_id):
    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.role.lower() not in ["manager", "admin", "support"]:
            return JsonResponse({"status": 403})
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": 403})

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            status = data.get("status")
            note = data.get("resolution_note", "")

            ticket = SupportTicket.objects.get(id=ticket_id)
            ticket.status = status
            ticket.resolution_note = note
            ticket.save()
            
            return JsonResponse({"status": 200, "message": "Ticket updated successfully"})
        except SupportTicket.DoesNotExist:
            return JsonResponse({"status": 404, "message": "Ticket not found"})
        except Exception as e:
            return JsonResponse({"status": 500, "message": str(e)})
    else:
        return JsonResponse({"status": 405, "message": "Method not allowed"})

# Product API Views
@require_GET
def get_products(request):
    """Get all active products with inventory information"""
    try:
        products_data = []
        
        # Simplified approach - try to query products directly
        try:
            products = Product.objects.filter(is_active=True).order_by('name')
            logger.info(f"Found {products.count()} products")
            
            for product in products:
                products_data.append({
                    "id": product.id,
                    "name": product.name,
                    "category": product.category,
                    "price": float(product.price),
                    "description": product.description,
                    "stock_quantity": product.stock_quantity,
                    "is_in_stock": product.is_in_stock,
                    "image_url": product.image_url,
                    "created_at": product.created_at.isoformat()
                })
            
            return JsonResponse({"status": 200, "products": products_data})
        
        except Exception as model_error:
            logger.error(f"Error querying Products model: {str(model_error)}")
            logger.error(traceback.format_exc())
            
            # Fallback: Try to query directly from the database
            logger.info("Attempting to query products directly from database...")
            
            try:
                with connection.cursor() as cursor:
                    # Check if table exists
                    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='djangoapp_product'")
                    if not cursor.fetchone():
                        return JsonResponse({
                            "status": 500, 
                            "message": "Product table does not exist. Please contact support."
                        })
                    
                    # Query products directly
                    cursor.execute("SELECT id, name, category, price, description, stock_quantity, image_url, is_active FROM djangoapp_product WHERE is_active=1 ORDER BY name")
                    raw_products = cursor.fetchall()
                    logger.info(f"Found {len(raw_products)} products using raw SQL")
                    
                    for product in raw_products:
                        products_data.append({
                            "id": product[0],
                            "name": product[1],
                            "category": product[2],
                            "price": float(product[3]),
                            "description": product[4],
                            "stock_quantity": product[5],
                            "is_in_stock": product[5] > 0,
                            "image_url": product[6],
                            "created_at": "2025-01-01T00:00:00"  # Default date as we can't get it from the cursor
                        })
                    
                    return JsonResponse({"status": 200, "products": products_data})
                
            except Exception as db_error:
                logger.error(f"Direct database query failed: {str(db_error)}")
                logger.error(traceback.format_exc())
                
                # Last resort: Return mock products to avoid client-side crashes
                logger.info("Returning mock products as last resort")
                return JsonResponse({
                    "status": 200, 
                    "products": [
                        {
                            "id": 1,
                            "name": "Emergency Backup Product",
                            "category": "Electronics",
                            "price": 99.99,
                            "description": "This is a backup product when database access fails.",
                            "stock_quantity": 10,
                            "is_in_stock": True,
                            "image_url": "https://via.placeholder.com/300",
                            "created_at": "2025-01-01T00:00:00"
                        },
                        {
                            "id": 2,
                            "name": "Fallback Product",
                            "category": "Other",
                            "price": 49.99,
                            "description": "Another backup product when database access fails.",
                            "stock_quantity": 5,
                            "is_in_stock": True,
                            "image_url": "https://via.placeholder.com/300",
                            "created_at": "2025-01-01T00:00:00"
                        }
                    ],
                    "database_status": "ERROR"
                })
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Critical error in get_products: {str(e)}\n{error_details}")
        
        # Return mock products even in case of critical error
        return JsonResponse({
            "status": 200, 
            "products": [
                {
                    "id": 999,
                    "name": "Critical Error Backup Product",
                    "category": "Error",
                    "price": 0.99,
                    "description": "Emergency product shown when critical errors occur.",
                    "stock_quantity": 1,
                    "is_in_stock": True,
                    "image_url": "https://via.placeholder.com/300",
                    "created_at": "2025-01-01T00:00:00"
                }
            ],
            "error": str(e),
            "database_status": "CRITICAL_ERROR"
        })

@require_GET
def get_product_categories(request):
    """Get all unique product categories"""
    try:
        categories = Product.objects.filter(is_active=True).values_list('category', flat=True).distinct()
        return JsonResponse({"status": 200, "categories": list(categories)})
    except Exception as e:
        return JsonResponse({"status": 500, "message": str(e)})

@require_GET
def get_product_detail(request, product_id):
    """Get a single product by ID"""
    try:
        product = get_object_or_404(Product, id=product_id, is_active=True)
        product_data = {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "price": float(product.price),
            "description": product.description,
            "stock_quantity": product.stock_quantity,
            "is_in_stock": product.is_in_stock,
            "image_url": product.image_url,
            "created_at": product.created_at.isoformat()
        }
        
        return JsonResponse({"status": 200, "product": product_data})
    except Product.DoesNotExist:
        return JsonResponse({"status": 404, "message": "Product not found"})
    except Exception as e:
        return JsonResponse({"status": 500, "message": str(e)})

# Cart API Views
@csrf_exempt
def cart_add_item(request):
    """Add item to shopping cart"""
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"status": 401, "message": "Authentication required"})
        
        try:
            data = json.loads(request.body)
            product_id = data.get('product_id')
            quantity = data.get('quantity', 1)
            
            # Validate product exists and is available
            try:
                product = Product.objects.get(id=product_id, is_active=True)
            except Product.DoesNotExist:
                return JsonResponse({"status": 404, "message": "Product not found"})
            
            # Check stock availability
            if quantity > product.stock_quantity:
                return JsonResponse({
                    "status": 400, 
                    "message": f"Only {product.stock_quantity} items available in stock"
                })
            
            # Add or update cart item
            cart_item, created = CartItem.objects.get_or_create(
                customer=request.user,
                product=product,
                defaults={'quantity': quantity}
            )
            
            if not created:
                # Update existing cart item
                new_quantity = cart_item.quantity + quantity
                if new_quantity > product.stock_quantity:
                    return JsonResponse({
                        "status": 400, 
                        "message": f"Cannot add {quantity} more. Only {product.stock_quantity - cart_item.quantity} more available"
                    })
                cart_item.quantity = new_quantity
                cart_item.save()
            
            return JsonResponse({
                "status": 200, 
                "message": "Item added to cart successfully",
                "cart_item": {
                    "id": cart_item.id,
                    "product_name": product.name,
                    "quantity": cart_item.quantity,
                    "total_price": float(cart_item.total_price)
                }
            })
        except Exception as e:
            return JsonResponse({"status": 500, "message": str(e)})
    else:
        return JsonResponse({"status": 405, "message": "Method not allowed"})

@csrf_exempt
def cart_update_item(request):
    """Update cart item quantity"""
    if request.method == "PUT":
        if not request.user.is_authenticated:
            return JsonResponse({"status": 401, "message": "Authentication required"})
        
        try:
            data = json.loads(request.body)
            cart_item_id = data.get('cart_item_id')
            quantity = data.get('quantity')
            
            try:
                cart_item = CartItem.objects.get(id=cart_item_id, customer=request.user)
            except CartItem.DoesNotExist:
                return JsonResponse({"status": 404, "message": "Cart item not found"})
            
            # Check stock availability
            if quantity > cart_item.product.stock_quantity:
                return JsonResponse({
                    "status": 400, 
                    "message": f"Only {cart_item.product.stock_quantity} items available in stock"
                })
            
            cart_item.quantity = quantity
            cart_item.save()
            
            return JsonResponse({
                "status": 200, 
                "message": "Cart updated successfully",
                "cart_item": {
                    "id": cart_item.id,
                    "quantity": cart_item.quantity,
                    "total_price": float(cart_item.total_price)
                }
            })
        except Exception as e:
            return JsonResponse({"status": 500, "message": str(e)})
    else:
        return JsonResponse({"status": 405, "message": "Method not allowed"})

@csrf_exempt
def cart_remove_item(request):
    """Remove item from cart"""
    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return JsonResponse({"status": 401, "message": "Authentication required"})
        
        try:
            data = json.loads(request.body)
            cart_item_id = data.get('cart_item_id')
            
            try:
                cart_item = CartItem.objects.get(id=cart_item_id, customer=request.user)
                cart_item.delete()
                return JsonResponse({"status": 200, "message": "Item removed from cart"})
            except CartItem.DoesNotExist:
                return JsonResponse({"status": 404, "message": "Cart item not found"})
        except Exception as e:
            return JsonResponse({"status": 500, "message": str(e)})
    else:
        return JsonResponse({"status": 405, "message": "Method not allowed"})

@require_GET
def get_cart(request):
    """Get user's shopping cart"""
    if not request.user.is_authenticated:
        return JsonResponse({"status": 401, "message": "Authentication required"})
    
    try:
        cart_items = CartItem.objects.filter(customer=request.user).order_by('-added_at')
        cart_data = []
        total_amount = 0
        
        for item in cart_items:
            item_data = {
                "id": item.id,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "price": float(item.product.price),
                    "image_url": item.product.image_url,
                    "stock_quantity": item.product.stock_quantity,
                    "is_in_stock": item.product.is_in_stock
                },
                "quantity": item.quantity,
                "total_price": float(item.total_price),
                "added_at": item.added_at.isoformat()
            }
            cart_data.append(item_data)
            total_amount += item.total_price
        
        return JsonResponse({
            "status": 200, 
            "cart_items": cart_data,
            "total_amount": float(total_amount),
            "item_count": len(cart_data)
        })
    except Exception as e:
        return JsonResponse({"status": 500, "message": str(e)})

@csrf_exempt
def cart_checkout(request):
    """Mock checkout process - convert cart to orders"""
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"status": 401, "message": "Authentication required"})
        
        try:
            cart_items = CartItem.objects.filter(customer=request.user)
            
            if not cart_items.exists():
                return JsonResponse({"status": 400, "message": "Cart is empty"})
            
            # Check stock availability for all items
            for item in cart_items:
                if item.quantity > item.product.stock_quantity:
                    return JsonResponse({
                        "status": 400, 
                        "message": f"Insufficient stock for {item.product.name}"
                    })
            
            # Generate transaction ID
            transaction_id = f"TXN{datetime.now().strftime('%Y%m%d%H%M%S')}{request.user.id}"
            orders_created = []
            
            # Create orders with pending status - don't update stock until approved
            for item in cart_items:
                order = Order.objects.create(
                    customer=request.user,
                    product=item.product,
                    quantity=item.quantity,
                    date_purchased=datetime.now().date(),
                    transaction_id=transaction_id,
                    total_amount=item.total_price,
                    status='pending'  # Orders start as pending for manager approval
                )
                
                # Don't update stock quantity here - wait for manager approval
                
                orders_created.append({
                    "id": order.id,
                    "product_name": item.product.name,
                    "quantity": item.quantity,
                    "total_amount": float(order.total_amount),
                    "status": order.status
                })
            
            # Clear cart
            cart_items.delete()
            
            return JsonResponse({
                "status": 200, 
                "message": "Order submitted successfully and is pending approval",
                "transaction_id": transaction_id,
                "orders": orders_created
            })
        except Exception as e:
            return JsonResponse({"status": 500, "message": str(e)})
    else:
        return JsonResponse({"status": 405, "message": "Method not allowed"})

# Order Fulfillment Management Views
@require_GET
def get_pending_orders(request):
    """Get all pending orders for manager review"""
    if not request.user.is_authenticated:
        return JsonResponse({"status": 401, "message": "Authentication required"})
    
    # Check if user has manager/admin role
    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.role not in ['admin', 'manager']:
            return JsonResponse({"status": 403, "message": "Access denied"})
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": 403, "message": "Access denied"})
    
    try:
        pending_orders = Order.objects.filter(status='pending').select_related('customer', 'product').order_by('-date_purchased')
        orders_data = []
        
        for order in pending_orders:
            orders_data.append({
                "id": order.id,
                "transaction_id": order.transaction_id,
                "customer_name": f"{order.customer.first_name} {order.customer.last_name}".strip() or order.customer.username,
                "customer_username": order.customer.username,
                "product_name": order.product.name,
                "product_category": order.product.category,
                "quantity": order.quantity,
                "unit_price": float(order.product.price),
                "total_amount": float(order.total_amount),
                "date_purchased": order.date_purchased.isoformat(),
                "status": order.status,
                "stock_available": order.product.stock_quantity,
                "notes": order.notes
            })
        
        return JsonResponse({"status": 200, "orders": orders_data})
    except Exception as e:
        return JsonResponse({"status": 500, "message": str(e)})

@require_GET
def get_all_orders_for_management(request):
    """Get all orders for management overview"""
    if not request.user.is_authenticated:
        return JsonResponse({"status": 401, "message": "Authentication required"})
    
    # Check if user has manager/admin role
    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.role not in ['admin', 'manager']:
            return JsonResponse({"status": 403, "message": "Access denied"})
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": 403, "message": "Access denied"})
    
    try:
        orders = Order.objects.all().select_related('customer', 'product', 'processed_by').order_by('-date_purchased')
        orders_data = []
        
        for order in orders:
            orders_data.append({
                "id": order.id,
                "transaction_id": order.transaction_id,
                "customer_name": f"{order.customer.first_name} {order.customer.last_name}".strip() or order.customer.username,
                "customer_username": order.customer.username,
                "product_name": order.product.name,
                "product_category": order.product.category,
                "quantity": order.quantity,
                "unit_price": float(order.product.price),
                "total_amount": float(order.total_amount),
                "date_purchased": order.date_purchased.isoformat(),
                "status": order.status,
                "processed_by": order.processed_by.username if order.processed_by else None,
                "processed_at": order.processed_at.isoformat() if order.processed_at else None,
                "notes": order.notes
            })
        
        return JsonResponse({"status": 200, "orders": orders_data})
    except Exception as e:
        return JsonResponse({"status": 500, "message": str(e)})

@csrf_exempt
def process_order(request):
    """Approve or reject an order"""
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"status": 401, "message": "Authentication required"})
        
        # Check if user has manager/admin role
        try:
            profile = UserProfile.objects.get(user=request.user)
            if profile.role not in ['admin', 'manager']:
                return JsonResponse({"status": 403, "message": "Access denied"})
        except UserProfile.DoesNotExist:
            return JsonResponse({"status": 403, "message": "Access denied"})
        
        try:
            data = json.loads(request.body)
            order_id = data.get('order_id')
            action = data.get('action')  # 'approve' or 'reject'
            notes = data.get('notes', '')
            
            if action not in ['approve', 'reject']:
                return JsonResponse({"status": 400, "message": "Invalid action"})
            
            try:
                order = Order.objects.get(id=order_id, status='pending')
            except Order.DoesNotExist:
                return JsonResponse({"status": 404, "message": "Order not found or already processed"})
            
            if action == 'approve':
                # Check if enough stock is available
                if order.quantity > order.product.stock_quantity:
                    return JsonResponse({
                        "status": 400, 
                        "message": f"Insufficient stock. Only {order.product.stock_quantity} items available"
                    })
                
                # Update stock quantity
                order.product.stock_quantity -= order.quantity
                order.product.save()
                
                # Update order status
                order.status = 'approved'
                order.processed_by = request.user
                order.processed_at = datetime.now()
                order.notes = notes
                order.save()
                
                message = f"Order {order.transaction_id} approved successfully"
            
            else:  # reject
                order.status = 'rejected'
                order.processed_by = request.user
                order.processed_at = datetime.now()
                order.notes = notes
                order.save()
                
                message = f"Order {order.transaction_id} rejected"
            
            return JsonResponse({
                "status": 200, 
                "message": message,
                "order": {
                    "id": order.id,
                    "status": order.status,
                    "processed_by": order.processed_by.username,
                    "processed_at": order.processed_at.isoformat()
                }
            })
        except Exception as e:
            return JsonResponse({"status": 500, "message": str(e)})
    else:
        return JsonResponse({"status": 405, "message": "Method not allowed"})

@require_GET
def get_inventory_overview(request):
    """Get inventory overview for management"""
    if not request.user.is_authenticated:
        return JsonResponse({"status": 401, "message": "Authentication required"})
    
    # Check if user has manager/admin role
    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.role not in ['admin', 'manager']:
            return JsonResponse({"status": 403, "message": "Access denied"})
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": 403, "message": "Access denied"})
    
    try:
        products = Product.objects.filter(is_active=True).order_by('name')
        inventory_data = []
        
        # Calculate pending orders for each product
        # Sum already imported at the top of the file
        
        for product in products:
            pending_quantity = Order.objects.filter(
                product=product, 
                status='pending'
            ).aggregate(Sum('quantity'))['quantity__sum'] or 0
            
            available_after_pending = product.stock_quantity - pending_quantity
            
            inventory_data.append({
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "price": float(product.price),
                "current_stock": product.stock_quantity,
                "pending_orders": pending_quantity,
                "available_after_pending": available_after_pending,
                "is_low_stock": product.stock_quantity <= 10,
                "is_out_of_stock": product.stock_quantity == 0,
                "created_at": product.created_at.isoformat()
            })
        
        return JsonResponse({"status": 200, "inventory": inventory_data})
    except Exception as e:
        return JsonResponse({"status": 500, "message": str(e)})

@require_GET
def get_reviews_for_management(request):
    # Check if user has manager/admin privileges
    user_role = None
    
    try:
        # Check if the user has a profile with a role
        if hasattr(request.user, 'userprofile'):
            user_role = request.user.userprofile.role.lower() if request.user.userprofile.role else None
    except:
        pass
    
    # Try to get the session role
    session_role = request.session.get('userRole', '').lower() if 'userRole' in request.session else None
    
    # Special check for demo users based on username (case insensitive)
    username_lower = request.user.username.lower()
    if username_lower.startswith('demo_') and ('admin' in username_lower or 'manager' in username_lower):
        return JsonResponse({"status": 200, "reviews": get_demo_reviews()})
    
    # Allow access if the user is staff, superuser, has admin/manager role in their profile, or in the session
    if not (request.user.is_staff or request.user.is_superuser or 
            user_role in ['admin', 'manager'] or 
            session_role in ['admin', 'manager']):
        return JsonResponse({"status": 403, "message": "Access denied"})
    
    # Get all reviews for management
    reviews = Review.objects.select_related('customer').order_by('-created_on')
    
    review_list = []
    for r in reviews:
        review_data = {
            'id': r.id,
            'customer': r.customer.username,
            'customer_name': f"{r.customer.first_name} {r.customer.last_name}".strip() or r.customer.username,
            'rating': r.rating,
            'review_text': r.review_text,
            'created_on': r.created_on,
            'moderated': getattr(r, 'moderated', False),
            'sentiment': r.sentiment
        }
        
        # Add product info if this is a legacy product review
        if hasattr(r, 'product') and r.product:
            review_data.update({
                'product_name': r.product.name,
                'product_id': r.product.id,
                'is_product_review': True
            })
        else:
            review_data.update({
                'is_product_review': False,
                'review_type': 'Shopping Experience'
            })
            
        review_list.append(review_data)
    
    return JsonResponse({"status": 200, "reviews": review_list})

@require_GET
def get_tickets_for_management(request):
    """Get all support tickets for management overview"""
    if not request.user.is_authenticated:
        return JsonResponse({"status": 401, "message": "Authentication required"})
    
    # Check if user has manager/admin role
    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.role not in ['admin', 'manager']:
            return JsonResponse({"status": 403, "message": "Access denied"})
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": 403, "message": "Access denied"})
    
    try:
        tickets = SupportTicket.objects.all().select_related('customer', 'product', 'order').order_by('-submitted_on')
        tickets_data = []
        
        for ticket in tickets:
            tickets_data.append({
                "id": ticket.id,
                "customer_name": f"{ticket.customer.first_name} {ticket.customer.last_name}".strip() or ticket.customer.username,
                "customer_username": ticket.customer.username,
                "product_name": ticket.product.name,
                "product_category": ticket.product.category,
                "order_id": ticket.order.id,
                "transaction_id": ticket.order.transaction_id,
                "issue_description": ticket.issue_description,
                "status": ticket.status,
                "submitted_on": ticket.submitted_on.isoformat(),
                "resolution_note": ticket.resolution_note,
                "has_attachment": bool(ticket.attachment)
            })
        
        return JsonResponse({"status": 200, "tickets": tickets_data})
    except Exception as e:
        return JsonResponse({"status": 500, "message": str(e)})

@csrf_exempt
@login_required
def post_experience_review(request):
    if request.method == "POST":
        data = json.loads(request.body)
        review_text = data.get("review")
        rating = data.get("rating")
        
        # Check if user has already submitted a review today
        today = datetime.datetime.now().date()
        has_review_today = Review.objects.filter(
            customer=request.user,
            created_on__date=today
        ).exists()
        
        if has_review_today:
            return JsonResponse({
                "status": 400, 
                "message": "You can only submit one review per day."
            })

        # Skip sentiment analysis for now
        sentiment = "neutral"
        
        # Create the review (no product association)
        review = Review.objects.create(
            customer=request.user,
            review_text=review_text,
            rating=rating,
            sentiment=sentiment
        )
        
        return JsonResponse({
            "status": 200, 
            "message": "Thank you for your feedback!",
            "review": {
                'id': review.id,
                'rating': review.rating,
                'review_text': review.review_text,
                'created_on': review.created_on.isoformat(),
            }
        })
    
    return JsonResponse({"status": 405, "message": "Method not allowed"})

@require_GET
def get_public_reviews(request):
    # Get reviews that can be publicly viewed (for all customers)
    reviews = Review.objects.select_related('customer').order_by('-created_on')[:50]  # Limit to most recent 50
    
    review_list = [
        {
            'id': r.id,
            'customer_name': r.customer.first_name if r.customer.first_name else r.customer.username,
            'rating': r.rating,
            'review_text': r.review_text,
            'created_on': r.created_on,
        }
        for r in reviews
    ]
    
    return JsonResponse({"status": 200, "reviews": review_list})

def get_demo_reviews():
    """Generate demo reviews for demo users"""
    import datetime
    
    # Create a list of demo reviews
    return [
        {
            'id': 1,
            'customer': 'john_doe',
            'customer_name': 'John Doe',
            'rating': 5,
            'review_text': 'Great shopping experience! The website is easy to navigate and the checkout process was smooth.',
            'created_on': (datetime.datetime.now() - datetime.timedelta(days=2)).isoformat(),
            'moderated': True,
            'sentiment': 'positive',
            'is_product_review': False,
            'review_type': 'Shopping Experience'
        },
        {
            'id': 2,
            'customer': 'jane_smith',
            'customer_name': 'Jane Smith',
            'rating': 4,
            'review_text': 'I love the product selection, but shipping took a bit longer than expected.',
            'created_on': (datetime.datetime.now() - datetime.timedelta(days=5)).isoformat(),
            'moderated': False,
            'sentiment': 'neutral',
            'is_product_review': False,
            'review_type': 'Shopping Experience'
        },
        {
            'id': 3,
            'customer': 'alex_wong',
            'customer_name': 'Alex Wong',
            'rating': 5,
            'review_text': 'The customer service team was incredibly helpful when I had an issue with my order.',
            'created_on': (datetime.datetime.now() - datetime.timedelta(days=1)).isoformat(),
            'moderated': False,
            'sentiment': 'positive',
            'is_product_review': False,
            'review_type': 'Shopping Experience'
        },
        {
            'id': 4,
            'customer': 'sarah_johnson',
            'customer_name': 'Sarah Johnson',
            'product_name': 'Smartphone XYZ',
            'product_id': 1,
            'rating': 3,
            'review_text': 'The smartphone has good features, but battery life could be better.',
            'created_on': (datetime.datetime.now() - datetime.timedelta(days=7)).isoformat(),
            'moderated': True,
            'sentiment': 'neutral',
            'is_product_review': True
        },
        {
            'id': 5,
            'customer': 'mike_taylor',
            'customer_name': 'Mike Taylor',
            'product_name': 'Laptop ABC',
            'product_id': 2,
            'rating': 5,
            'review_text': 'Amazing laptop! Fast performance and great display.',
            'created_on': (datetime.datetime.now() - datetime.timedelta(days=3)).isoformat(),
            'moderated': True,
            'sentiment': 'positive',
            'is_product_review': True
        }
    ]
