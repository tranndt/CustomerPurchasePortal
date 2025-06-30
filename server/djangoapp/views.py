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
    # Get username and password from request.POST dictionary
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    # Try to check if provide credential can be authenticated
    user = authenticate(username=username, password=password)
    data = {"userName": username}
    if user is not None:
        # If user is valid, call login method to login current user
        login(request, user)
        data = {"userName": username, "status": "Authenticated"}
    return JsonResponse(data)

# Create a `logout_request` view to handle sign out request
def logout_user(request):
    logout(request)
    return JsonResponse({"userName": ""})


# Create a `registration` view to handle sign up request
# @csrf_exempt
@csrf_exempt
def register_user(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if User.objects.filter(username=data["userName"]).exists():
            return JsonResponse({"status": False, "error": "Already Registered"})

        user = User.objects.create_user(
            username=data["userName"],
            password=data["password"],
            first_name=data["firstName"],
            last_name=data["lastName"],
            email=data["email"]
        )
        login(request, user)
        return JsonResponse({"status": True, "userName": user.username})

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
        return JsonResponse({"dealerships": dealerships})

# Create a `get_dealer_reviews` view to render the reviews of a dealer
def get_dealer_reviews(request, dealer_id):
    if request.method == "GET":
        context = {}
        # Get dealer reviews from the URL
        reviews = get_request("/fetchReviews/dealer/" + str(dealer_id))
        context["review_list"] = reviews
        return JsonResponse({"reviews": reviews})

# Create a `get_dealer_details` view to render the dealer details
def get_dealer_details(request, dealer_id):
    if request.method == "GET":
        context = {}
        # Get dealer details from the URL
        dealer = get_request("/fetchDealer/" + str(dealer_id))
        context["dealer"] = dealer
        return JsonResponse({"dealer": dealer})
    

def get_cars(request):
    count = CarMake.objects.count()
    if count == 0:
        from .populate import initiate
        initiate()
    car_models = CarModel.objects.select_related('car_make')
    cars = [{"CarModel": c.name, "CarMake": c.car_make.name} for c in car_models]
    return JsonResponse({"CarModels": cars})


# Create a `add_review` view to submit a review
@csrf_exempt
def add_review(request):
    if request.method == "GET":
        return JsonResponse({"status": "error", "message": "GET not supported"})
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            
            # Extract review data - the actual review data is nested under "review" key
            review_data = data.get("review", {})
            review_text = review_data.get("review", "")
            
            # Analyze sentiment
            sentiment_response = analyze_review_sentiments(review_text)
            
            # Add sentiment to the review data
            if sentiment_response:
                review_data["sentiment"] = sentiment_response
            
            # Post review with the review data
            response = post_review(review_data)
            return JsonResponse({"status": "success", "review": response})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method"})
