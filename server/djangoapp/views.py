# Uncomment the required imports before adding the code

from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import login, logout
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib import messages
from datetime import datetime

from django.http import JsonResponse
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET
import logging
import json
from django.views.decorators.csrf import csrf_exempt
from .restapis import get_request, analyze_review_sentiments, post_review
from .models import CarMake, CarModel
from django.http import JsonResponse
# from .populate import initiate

from .models import UserProfile, Product, Order, Review, SupportTicket
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

# # # Update the `get_dealerships` view to render the index page with
# # a list of dealerships
# def get_dealerships(request, state=None):
#     if request.method == "GET":
#         context = {}
#         # Get dealers from the URL
#         if state:
#             dealerships = get_request("/fetchDealers/" + state)
#         else:
#             dealerships = get_request("/fetchDealers")
#         context["dealership_list"] = dealerships
        
#         # Return data in format expected by React app
#         if dealerships:
#             return JsonResponse({"status": 200, "dealers": dealerships})
#         else:
#             return JsonResponse({"status": 404, "dealers": [], "message": "No dealerships found"})

# # Create a `get_dealer_reviews` view to render the reviews of a dealer
# def get_dealer_reviews(request, dealer_id):
#     if request.method == "GET":
#         context = {}
#         # Get dealer reviews from the URL
#         reviews = get_request("/fetchReviews/dealer/" + str(dealer_id))
#         context["review_list"] = reviews
#         if reviews is not None:
#             # Add sentiment analysis to reviews that don't have it
#             for review in reviews:
#                 # Check if sentiment is missing, null, or empty
#                 if not review.get('sentiment') or review.get('sentiment') in [None, '', 'null']:
#                     # Analyze sentiment for this review
#                     review_text = review.get('review', '')
#                     sentiment_response = analyze_review_sentiments(review_text)
#                     if sentiment_response and 'label' in sentiment_response:
#                         # Convert the label to lowercase to match the React component expectations
#                         sentiment_label = sentiment_response['label'].lower()
#                         review['sentiment'] = sentiment_label
#                     else:
#                         review['sentiment'] = 'neutral'
            
#             return JsonResponse({"status": 200, "reviews": reviews})
#         else:
#             return JsonResponse({"status": 404, "reviews": [], "message": "No reviews found or service unavailable"})

# # Create a `get_dealer_details` view to render the dealer details
# def get_dealer_details(request, dealer_id):
#     if request.method == "GET":
#         context = {}
#         # Get dealer details from the URL
#         dealer = get_request("/fetchDealer/" + str(dealer_id))
#         context["dealer"] = dealer
#         if dealer is not None:
#             return JsonResponse({"status": 200, "dealer": dealer})
#         else:
#             return JsonResponse({"status": 404, "dealer": None, "message": "Dealer not found or service unavailable"})
    

# def get_cars(request):
#     count = CarMake.objects.count()
#     if count == 0:
#         from .populate import initiate
#         initiate()
#     car_models = CarModel.objects.select_related('car_make')
#     cars = [{"CarModel": c.name, "CarMake": c.car_make.name} for c in car_models]
#     return JsonResponse({"status": 200, "CarModels": cars})


# # Create a `add_review` view to submit a review
# @csrf_exempt
# def add_review(request):
#     if request.method == "GET":
#         return JsonResponse({"status": "error", "message": "GET not supported"})
#     elif request.method == "POST":
#         try:
#             data = json.loads(request.body)
#             print(f"DEBUG: Received data: {data}")
            
#             # Extract review text for sentiment analysis
#             review_text = data.get("review", "")
#             print(f"DEBUG: Review text: {review_text}")
            
#             # Analyze sentiment
#             sentiment_response = analyze_review_sentiments(review_text)
#             print(f"DEBUG: Sentiment response: {sentiment_response}")
            
#             # Add sentiment to the review data
#             if sentiment_response:
#                 data["sentiment"] = sentiment_response
            
#             # Post review with the review data
#             print(f"DEBUG: About to call post_review with data: {data}")
#             response = post_review(data)
#             print(f"DEBUG: Post review response: {response}")
#             return JsonResponse({"status": 200, "review": response})
#         except Exception as e:
#             print(f"DEBUG: Exception occurred: {e}")
#             import traceback
#             traceback.print_exc()
#             return JsonResponse({"status": "error", "message": str(e)})
#     else:
#         return JsonResponse({"status": "error", "message": "Invalid request method"})


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
            # Get all users for demo purposes (limit to first 10 for safety)
            users = User.objects.all()[:10]
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
            return JsonResponse({"status": 500, "error": "Failed to fetch demo users", "message": str(e)})
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
