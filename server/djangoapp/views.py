# Uncomment the required imports before adding the code

from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import logout
from django.contrib import messages
from datetime import datetime

from django.http import JsonResponse
from django.contrib.auth import login, authenticate
import logging
import json
from django.views.decorators.csrf import csrf_exempt
from .restapis import get_request, analyze_review_sentiments, post_review
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
# def logout_request(request):
# ...

# Create a `registration` view to handle sign up request
# @csrf_exempt
# def registration(request):
# ...

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

# Create a `add_review` view to submit a review
@csrf_exempt
def add_review(request):
    if request.method == "GET":
        return JsonResponse({"status": "error", "message": "GET not supported"})
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            # Analyze sentiment
            review_text = data.get("review", "")
            sentiment_response = analyze_review_sentiments(review_text)
            
            # Add sentiment to the review data
            if sentiment_response:
                data["sentiment"] = sentiment_response
            
            # Post review
            response = post_review(data)
            return JsonResponse({"status": "success", "review": response})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method"})
