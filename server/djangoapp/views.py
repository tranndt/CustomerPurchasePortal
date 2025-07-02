# Required imports for the views

from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from datetime import datetime
import logging
import json

from .restapis import get_request, analyze_review_sentiments, post_review
from .models import UserProfile, Product, Order, Review, SupportTicket, CartItem, CartItem

# Get an instance of a logger
logger = logging.getLogger(__name__)

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
    reviews = Review.objects.filter(customer=request.user).select_related('product').order_by('-created_on')
    review_list = [
        {
            'id': r.id,
            'product_name': r.product.name,
            'rating': r.rating,
            'review_text': r.review_text,
            'created_on': r.created_on,
        }
        for r in reviews
    ]
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
        products = Product.objects.filter(is_active=True).order_by('name')
        products_data = []
        
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
    except Exception as e:
        return JsonResponse({"status": 500, "message": str(e)})

@require_GET
def get_product_categories(request):
    """Get all unique product categories"""
    try:
        categories = Product.objects.filter(is_active=True).values_list('category', flat=True).distinct()
        return JsonResponse({"status": 200, "categories": list(categories)})
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
            
            # Create orders and update stock
            for item in cart_items:
                order = Order.objects.create(
                    customer=request.user,
                    product=item.product,
                    quantity=item.quantity,
                    date_purchased=datetime.now().date(),
                    transaction_id=transaction_id,
                    total_amount=item.total_price
                )
                
                # Update stock quantity
                item.product.stock_quantity -= item.quantity
                item.product.save()
                
                orders_created.append({
                    "id": order.id,
                    "product_name": item.product.name,
                    "quantity": item.quantity,
                    "total_amount": float(order.total_amount)
                })
            
            # Clear cart
            cart_items.delete()
            
            return JsonResponse({
                "status": 200, 
                "message": "Purchase completed successfully",
                "transaction_id": transaction_id,
                "orders": orders_created
            })
        except Exception as e:
            return JsonResponse({"status": 500, "message": str(e)})
    else:
        return JsonResponse({"status": 405, "message": "Method not allowed"})
