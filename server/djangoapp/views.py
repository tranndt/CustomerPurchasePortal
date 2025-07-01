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
import logging
import json
from django.views.decorators.csrf import csrf_exempt
from .restapis import get_request, analyze_review_sentiments, post_review
from .models import CarMake, CarModel
from django.http import JsonResponse
# from .populate import initiate


# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.

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
                return JsonResponse({"status": 200, "userName": username, "message": "Authenticated"})
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
            login(request, user)
            return JsonResponse({"status": 201, "userName": user.username, "message": "User registered successfully"})
        except Exception as e:
            return JsonResponse({"status": 400, "error": "Registration failed", "message": str(e)})
    else:
        return JsonResponse({"status": 405, "error": "Method not allowed", "message": "Only POST method is supported"})

# # Update the `get_dealerships` view to render the index page with
# a list of dealerships
def get_dealerships(request, state=None):
    if request.method == "GET":
        context = {}
        # Get dealers from the URL
        if state:
            dealerships = get_request("/fetchDealers/" + state)
        else:
            dealerships = get_request("/fetchDealers")
        context["dealership_list"] = dealerships
        
        # Return data in format expected by React app
        if dealerships:
            return JsonResponse({"status": 200, "dealers": dealerships})
        else:
            return JsonResponse({"status": 404, "dealers": [], "message": "No dealerships found"})

# Create a `get_dealer_reviews` view to render the reviews of a dealer
def get_dealer_reviews(request, dealer_id):
    if request.method == "GET":
        context = {}
        # Get dealer reviews from the URL
        reviews = get_request("/fetchReviews/dealer/" + str(dealer_id))
        context["review_list"] = reviews
        if reviews is not None:
            # Add sentiment analysis to reviews that don't have it
            for review in reviews:
                # Check if sentiment is missing, null, or empty
                if not review.get('sentiment') or review.get('sentiment') in [None, '', 'null']:
                    # Analyze sentiment for this review
                    review_text = review.get('review', '')
                    sentiment_response = analyze_review_sentiments(review_text)
                    if sentiment_response and 'label' in sentiment_response:
                        # Convert the label to lowercase to match the React component expectations
                        sentiment_label = sentiment_response['label'].lower()
                        review['sentiment'] = sentiment_label
                    else:
                        review['sentiment'] = 'neutral'
            
            return JsonResponse({"status": 200, "reviews": reviews})
        else:
            return JsonResponse({"status": 404, "reviews": [], "message": "No reviews found or service unavailable"})

# Create a `get_dealer_details` view to render the dealer details
def get_dealer_details(request, dealer_id):
    if request.method == "GET":
        context = {}
        # Get dealer details from the URL
        dealer = get_request("/fetchDealer/" + str(dealer_id))
        context["dealer"] = dealer
        if dealer is not None:
            return JsonResponse({"status": 200, "dealer": dealer})
        else:
            return JsonResponse({"status": 404, "dealer": None, "message": "Dealer not found or service unavailable"})
    

def get_cars(request):
    count = CarMake.objects.count()
    if count == 0:
        from .populate import initiate
        initiate()
    car_models = CarModel.objects.select_related('car_make')
    cars = [{"CarModel": c.name, "CarMake": c.car_make.name} for c in car_models]
    return JsonResponse({"status": 200, "CarModels": cars})


# Create a `add_review` view to submit a review
@csrf_exempt
def add_review(request):
    if request.method == "GET":
        return JsonResponse({"status": "error", "message": "GET not supported"})
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            print(f"DEBUG: Received data: {data}")
            
            # Extract review text for sentiment analysis
            review_text = data.get("review", "")
            print(f"DEBUG: Review text: {review_text}")
            
            # Analyze sentiment
            sentiment_response = analyze_review_sentiments(review_text)
            print(f"DEBUG: Sentiment response: {sentiment_response}")
            
            # Add sentiment to the review data
            if sentiment_response:
                data["sentiment"] = sentiment_response
            
            # Post review with the review data
            print(f"DEBUG: About to call post_review with data: {data}")
            response = post_review(data)
            print(f"DEBUG: Post review response: {response}")
            return JsonResponse({"status": 200, "review": response})
        except Exception as e:
            print(f"DEBUG: Exception occurred: {e}")
            import traceback
            traceback.print_exc()
            return JsonResponse({"status": "error", "message": str(e)})
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method"})

