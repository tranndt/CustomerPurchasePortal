from django.contrib.auth.models import User
from .models import UserProfile, Product, Order, Review, SupportTicket
from django.contrib.auth.hashers import make_password
from datetime import datetime, timedelta

def initiate():
    # Create demo users - Only 3 specific demo profiles
    demo_users_data = [
        {
            "username": "demo_customer", 
            "first_name": "Demo", 
            "last_name": "Customer", 
            "email": "demo.customer@portal.com",
            "password": "password123",
            "role": "customer"
        },
        {
            "username": "demo_admin", 
            "first_name": "Demo", 
            "last_name": "Admin", 
            "email": "demo.admin@portal.com",
            "password": "password123",
            "role": "admin"
        },
        {
            "username": "demo_support", 
            "first_name": "Demo", 
            "last_name": "Support", 
            "email": "demo.support@portal.com",
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
    
    # Create demo products (general e-commerce products and services)
    products_data = [
        {
            "name": "Premium Membership", 
            "category": "Membership",
            "description": "Annual premium membership with exclusive benefits and priority support", 
            "price": 299.99,
            "stock_quantity": 100,
            "image_url": "https://via.placeholder.com/300x200/007bff/ffffff?text=Premium+Membership"
        },
        {
            "name": "Extended Warranty", 
            "category": "Warranty",
            "description": "3-year extended warranty package with comprehensive coverage", 
            "price": 199.99,
            "stock_quantity": 50,
            "image_url": "https://via.placeholder.com/300x200/28a745/ffffff?text=Extended+Warranty"
        },
        {
            "name": "Express Shipping", 
            "category": "Shipping",
            "description": "Next-day delivery service available nationwide", 
            "price": 19.99,
            "stock_quantity": 1000,
            "image_url": "https://via.placeholder.com/300x200/ffc107/000000?text=Express+Shipping"
        },
        {
            "name": "Gift Card $50", 
            "category": "Gift Cards",
            "description": "Digital gift card worth $50 - perfect for any occasion", 
            "price": 50.00,
            "stock_quantity": 200,
            "image_url": "https://via.placeholder.com/300x200/dc3545/ffffff?text=Gift+Card+$50"
        },
        {
            "name": "Customer Support Priority", 
            "category": "Support",
            "description": "Priority customer support service with dedicated agent", 
            "price": 79.99,
            "stock_quantity": 30,
            "image_url": "https://via.placeholder.com/300x200/17a2b8/ffffff?text=Priority+Support"
        },
        {
            "name": "Product Protection Plan", 
            "category": "Protection",
            "description": "Comprehensive product protection coverage against damage", 
            "price": 149.99,
            "stock_quantity": 75,
            "image_url": "https://via.placeholder.com/300x200/6f42c1/ffffff?text=Protection+Plan"
        },
        {
            "name": "Installation Service", 
            "category": "Services",
            "description": "Professional installation and setup service by certified technicians", 
            "price": 99.99,
            "stock_quantity": 25,
            "image_url": "https://via.placeholder.com/300x200/fd7e14/ffffff?text=Installation+Service"
        },
        {
            "name": "Maintenance Package", 
            "category": "Services",
            "description": "Annual maintenance and service plan with regular check-ups", 
            "price": 129.99,
            "stock_quantity": 40,
            "image_url": "https://via.placeholder.com/300x200/20c997/ffffff?text=Maintenance+Package"
        },
        {
            "name": "Digital Security Suite", 
            "category": "Software",
            "description": "Complete digital security package with antivirus and firewall", 
            "price": 89.99,
            "stock_quantity": 150,
            "image_url": "https://via.placeholder.com/300x200/e83e8c/ffffff?text=Security+Suite"
        },
        {
            "name": "Cloud Storage 1TB", 
            "category": "Storage",
            "description": "1TB cloud storage with automatic backup and sync", 
            "price": 120.00,
            "stock_quantity": 80,
            "image_url": "https://via.placeholder.com/300x200/6c757d/ffffff?text=Cloud+Storage"
        },
        {
            "name": "Training Course Access", 
            "category": "Education",
            "description": "Access to premium online training courses and certifications", 
            "price": 249.99,
            "stock_quantity": 60,
            "image_url": "https://via.placeholder.com/300x200/343a40/ffffff?text=Training+Course"
        },
        {
            "name": "Mobile App Premium", 
            "category": "Software",
            "description": "Premium mobile app features with advanced analytics", 
            "price": 49.99,
            "stock_quantity": 300,
            "image_url": "https://via.placeholder.com/300x200/007bff/ffffff?text=Mobile+App+Pro"
        }
    ]
    
    for product_data in products_data:
        if not Product.objects.filter(name=product_data["name"]).exists():
            Product.objects.create(**product_data)
    
    # Create sample orders for demo users
    users = User.objects.filter(username__in=["demo_customer", "demo_admin", "demo_support"])
    products = Product.objects.all()
    
    if users.exists() and products.exists():
        # Create orders specifically for demo_customer
        demo_customer = users.filter(username="demo_customer").first()
        if demo_customer:
            order_data = [
                (0, 30), (1, 15), (2, 5), (3, 45), (4, 60)  # (product_index, days_ago)
            ]
            for product_idx, days_ago in order_data:
                if product_idx < len(products):
                    if not Order.objects.filter(customer=demo_customer, product=products[product_idx]).exists():
                        Order.objects.create(
                            customer=demo_customer,
                            product=products[product_idx],
                            quantity=1,
                            date_purchased=(datetime.now() - timedelta(days=days_ago)).date(),
                            transaction_id=f"TXN{demo_customer.id}{product_idx:03d}{products[product_idx].id:03d}",
                            total_amount=products[product_idx].price
                        )
    
    # Create rich demo data for the three demo users
    
    # Create sample reviews from demo users
    demo_customer = users.filter(username="demo_customer").first()
    demo_admin = users.filter(username="demo_admin").first()
    demo_support = users.filter(username="demo_support").first()
    
    if demo_customer and products.exists():
        # Demo Customer Reviews
        review_data = [
            {
                "customer": demo_customer,
                "product": products[0],  # Premium Membership
                "review_text": "Amazing premium membership benefits! The exclusive features are worth every penny.",
                "rating": 5,
                "sentiment": "positive"
            },
            {
                "customer": demo_customer,
                "product": products[2],  # Express Shipping
                "review_text": "Fast delivery service. My order arrived exactly when promised.",
                "rating": 5,
                "sentiment": "positive"
            },
            {
                "customer": demo_customer,
                "product": products[1],  # Extended Warranty
                "review_text": "Good warranty coverage but the claim process could be faster.",
                "rating": 3,
                "sentiment": "neutral"
            }
        ]
        
        for review in review_data:
            if not Review.objects.filter(customer=review["customer"], product=review["product"]).exists():
                Review.objects.create(
                    customer=review["customer"],
                    product=review["product"],
                    review_text=review["review_text"],
                    rating=review["rating"],
                    sentiment=review["sentiment"]
                )
    
    # Additional orders for comprehensive demo data
    if demo_customer and products.exists():
        additional_orders = [
            (3, 10),  # Gift Card, 10 days ago
            (4, 25),  # Customer Support Priority, 25 days ago
            (5, 40)   # Product Protection Plan, 40 days ago
        ]
        
        for product_idx, days_ago in additional_orders:
            if product_idx < len(products):
                if not Order.objects.filter(customer=demo_customer, product=products[product_idx]).exists():
                    Order.objects.create(
                        customer=demo_customer,
                        product=products[product_idx],
                        quantity=1,
                        date_purchased=(datetime.now() - timedelta(days=days_ago)).date(),
                        transaction_id=f"TXN{demo_customer.id}{product_idx:03d}{products[product_idx].id:03d}",
                        total_amount=products[product_idx].price
                    )



