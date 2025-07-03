from django.contrib.auth.models import User
from .models import UserProfile, Product, Order, Review, SupportTicket
from django.contrib.auth.hashers import make_password
from datetime import datetime, timedelta
import csv
import os
import random

def load_products_from_csv():
    """Load products from CSV file and create Product objects"""
    # Path to the CSV file
    csv_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'database', 'data', 'Products.csv'
    )
    
    if not os.path.exists(csv_path):
        print(f"CSV file not found: {csv_path}")
        return
    
    print(f"Loading products from: {csv_path}")
    
    products_created = 0
    products_updated = 0
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            # Clean and parse price
            price_str = row.get('Price', '0').replace('CA$', '').replace('$', '').replace(',', '').strip()
            try:
                price = float(price_str)
            except ValueError:
                price = 0.0
            
            # Generate description based on CSV data
            brand = row.get('Brand', '').strip()
            # Handle BOM in the first column
            category = row.get('Category', row.get('\ufeffCategory', '')).strip()
            subcategory = row.get('Subcategory', '').strip()
            subcategory2 = row.get('Subcategory2', '').strip()
            product_name = row.get('Product name', '').strip()
            
            # Create a meaningful description
            description_parts = []
            if brand:
                description_parts.append(f"High-quality {brand}")
            if subcategory and subcategory != category:
                description_parts.append(subcategory.lower())
            if subcategory2 and subcategory2 != subcategory:
                description_parts.append(subcategory2.lower())
            if category:
                description_parts.append(f"in the {category.lower()} category")
            
            if description_parts:
                description = " ".join(description_parts) + "."
            else:
                description = f"Quality {product_name.lower()} product."
            
            # Make description more descriptive
            if 'laptop' in product_name.lower():
                description = f"Premium {brand} laptop featuring {subcategory2} specifications. Perfect for {subcategory.lower().replace('laptop', '').strip()} use with excellent performance and reliability."
            elif 'desktop' in product_name.lower() or 'pc' in product_name.lower():
                description = f"Powerful {brand} desktop computer with {subcategory2} performance. Ideal for {subcategory.lower().replace('pc', '').strip()} applications with robust processing capabilities."
            elif 'phone' in product_name.lower() or 'smartphone' in product_name.lower():
                description = f"Latest {brand} smartphone with cutting-edge technology. Features advanced capabilities and premium build quality for modern mobile communication."
            elif 'tv' in product_name.lower():
                description = f"Stunning {brand} television with {subcategory2} display technology. Delivers exceptional picture quality and immersive viewing experience."
            elif 'printer' in product_name.lower():
                description = f"Professional {brand} printer designed for {subcategory2.lower()} printing needs. Reliable, efficient, and produces high-quality prints."
            elif 'vacuum' in product_name.lower():
                description = f"Advanced {brand} vacuum cleaner with {subcategory2.lower()} technology. Powerful suction and convenient design for effective home cleaning."
            elif 'microwave' in product_name.lower():
                description = f"Efficient {brand} microwave oven with {subcategory2.lower()} capacity. Perfect for quick cooking and reheating with user-friendly controls."
            elif 'fridge' in product_name.lower() or 'refridgerator' in product_name.lower():
                description = f"Spacious {brand} refrigerator with {subcategory2.lower()} design. Energy-efficient cooling with ample storage space for all your food items."
            elif 'washing machine' in product_name.lower():
                description = f"Reliable {brand} washing machine with {subcategory2.lower()} capacity. Advanced cleaning technology with multiple wash cycles for different fabric types."
            elif 'headphone' in product_name.lower() or 'earbuds' in product_name.lower():
                description = f"Premium {brand} audio device with {subcategory2.lower()} design. Superior sound quality and comfort for extended listening sessions."
            elif 'soundbar' in product_name.lower():
                description = f"High-performance {brand} soundbar with {subcategory2.lower()} configuration. Enhanced audio experience with clear dialogue and immersive surround sound."
            elif 'dashcam' in product_name.lower():
                description = f"Advanced {brand} dashboard camera with {subcategory2.lower()} recording. Reliable road safety companion with high-definition video capture."
            elif 'ink' in product_name.lower():
                description = f"Compatible {brand} ink cartridge for {subcategory2.lower()} printing. High-quality ink formulation for sharp text and vibrant colors."
            
            # Generate realistic stock quantity
            stock_quantity = random.randint(10, 500)
            
            # Create or update product
            product, created = Product.objects.update_or_create(
                name=product_name,
                defaults={
                    'category': category,
                    'price': price,
                    'description': description,
                    'stock_quantity': stock_quantity,
                    'image_url': row.get('Image Url', '').strip(),
                    'is_active': True,
                }
            )
            
            if created:
                products_created += 1
            else:
                products_updated += 1
    
    print(f"Successfully loaded {products_created} new products and updated {products_updated} existing products")
    return products_created, products_updated

def initiate():
    # Load products from CSV first
    print("Loading products from CSV file...")
    load_products_from_csv()
    
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
        # Demo Customer Reviews (general reviews, not product-specific)
        review_data = [
            {
                "customer": demo_customer,
                "review_text": "Amazing shopping experience! The exclusive features and benefits are worth every penny.",
                "rating": 5,
                "sentiment": "positive"
            },
            {
                "customer": demo_customer,
                "review_text": "Fast delivery service. My orders always arrive exactly when promised.",
                "rating": 5,
                "sentiment": "positive"
            },
            {
                "customer": demo_customer,
                "review_text": "Good customer service but the response time could be faster.",
                "rating": 3,
                "sentiment": "neutral"
            }
        ]
        
        for review in review_data:
            if not Review.objects.filter(customer=review["customer"], review_text=review["review_text"]).exists():
                Review.objects.create(
                    customer=review["customer"],
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



