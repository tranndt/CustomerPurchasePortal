from django.contrib.auth.models import User
from .models import CarMake, CarModel, UserProfile, Product, Order, Review, SupportTicket
from django.contrib.auth.hashers import make_password
from datetime import datetime, timedelta

def initiate():
    # Create demo users
    demo_users_data = [
        {
            "username": "customer1", 
            "first_name": "John", 
            "last_name": "Doe", 
            "email": "john.doe@example.com",
            "password": "password123",
            "role": "customer"
        },
        {
            "username": "customer2", 
            "first_name": "Jane", 
            "last_name": "Smith", 
            "email": "jane.smith@example.com",
            "password": "password123",
            "role": "customer"
        },
        {
            "username": "admin1", 
            "first_name": "Admin", 
            "last_name": "User", 
            "email": "admin@example.com",
            "password": "password123",
            "role": "admin"
        },
        {
            "username": "manager1", 
            "first_name": "Manager", 
            "last_name": "User", 
            "email": "manager@example.com",
            "password": "password123",
            "role": "manager"
        },
        {
            "username": "customer3", 
            "first_name": "Alice", 
            "last_name": "Johnson", 
            "email": "alice.johnson@example.com",
            "password": "password123",
            "role": "customer"
        },
        {
            "username": "support1", 
            "first_name": "Support", 
            "last_name": "Agent", 
            "email": "support@example.com",
            "password": "password123",
            "role": "support"
        }
    ]
    
    # Create users and profiles
    for user_data in demo_users_data:
        # Check if user already exists
        if not User.objects.filter(username=user_data["username"]).exists():
            user = User.objects.create(
                username=user_data["username"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                email=user_data["email"],
                password=make_password(user_data["password"])
            )
            
            # Create user profile
            UserProfile.objects.create(
                user=user,
                role=user_data["role"]
            )
    
    # Create demo products
    products_data = [
        {"name": "Laptop Pro", "description": "High-performance laptop", "price": 1299.99},
        {"name": "Smartphone X", "description": "Latest smartphone", "price": 799.99},
        {"name": "Wireless Headphones", "description": "Noise-canceling headphones", "price": 299.99},
        {"name": "Gaming Mouse", "description": "RGB gaming mouse", "price": 79.99},
        {"name": "Mechanical Keyboard", "description": "RGB mechanical keyboard", "price": 149.99}
    ]
    
    for product_data in products_data:
        if not Product.objects.filter(name=product_data["name"]).exists():
            Product.objects.create(**product_data)
    
    # Create sample orders for demo users
    users = User.objects.filter(username__in=["customer1", "customer2", "customer3"])
    products = Product.objects.all()
    
    if users.exists() and products.exists():
        for i, user in enumerate(users):
            # Create 2-3 orders per user
            for j in range(2 + (i % 2)):  # 2-3 orders
                if not Order.objects.filter(customer=user, product=products[j % len(products)]).exists():
                    Order.objects.create(
                        customer=user,
                        product=products[j % len(products)],
                        date_purchased=(datetime.now() - timedelta(days=10 + j * 5)).date(),
                        transaction_id=f"TXN{user.id}{j:03d}{products[j % len(products)].id:03d}"
                    )

    # # Old car data (keeping for compatibility)
    # car_make_data = [
    #     {"name":"NISSAN", "description":"Japanese engineering"},
    #     {"name":"Toyota", "description":"Reliable vehicles"},
    # ]
    
    # for make_data in car_make_data:
    #     if not CarMake.objects.filter(name=make_data["name"]).exists():
    #         CarMake.objects.create(**make_data)
    
    # car_makes = CarMake.objects.all()
    # if car_makes:
    #     car_model_data = [
    #         {"name":"Pathfinder", "type":"SUV", "year":2023, "car_make":car_makes[0], "dealer_id":1},
    #         {"name":"Camry", "type":"Sedan", "year":2023, "car_make":car_makes[1] if len(car_makes) > 1 else car_makes[0], "dealer_id":2},
    #     ]
    #     for model_data in car_model_data:
    #         if not CarModel.objects.filter(name=model_data["name"]).exists():
    #             CarModel.objects.create(**model_data)

