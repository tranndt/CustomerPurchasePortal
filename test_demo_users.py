#!/usr/bin/env python3
"""
Test script to verify demo user creation logic
"""

import os
import sys
import django

# Add the server directory to the Python path
sys.path.insert(0, '/Users/jasetran/Jase/Projects/xrwvm-fullstack_developer_capstone/server')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from djangoapp.models import UserProfile

def test_demo_user_creation():
    """Test creating demo users"""
    print("Testing demo user creation...")
    
    demo_users_data = [
        {
            'username': 'demo_customer',
            'first_name': 'Demo',
            'last_name': 'Customer',
            'email': 'demo.customer@portal.com',
            'password': 'password123',
            'role': 'customer'
        },
        {
            'username': 'demo_admin',
            'first_name': 'Demo',
            'last_name': 'Admin',
            'email': 'demo.admin@portal.com',
            'password': 'password123',
            'role': 'admin'
        },
        {
            'username': 'demo_support',
            'first_name': 'Demo',
            'last_name': 'Support',
            'email': 'demo.support@portal.com',
            'password': 'password123',
            'role': 'support'
        }
    ]
    
    users_created = 0
    for user_data in demo_users_data:
        if not User.objects.filter(username=user_data['username']).exists():
            user = User.objects.create(
                username=user_data['username'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                email=user_data['email'],
                password=make_password(user_data['password'])
            )
            
            # Create user profile
            UserProfile.objects.create(
                user=user,
                role=user_data['role']
            )
            users_created += 1
            print(f'Created demo user: {user_data["username"]}')
        else:
            print(f'Demo user already exists: {user_data["username"]}')
    
    print(f'Created {users_created} new demo users')
    print(f'Total demo users: {User.objects.filter(username__startswith="demo_").count()}')
    
    # Test login credentials
    print("\nTesting demo user authentication...")
    from django.contrib.auth import authenticate
    
    for user_data in demo_users_data:
        user = authenticate(username=user_data['username'], password=user_data['password'])
        if user:
            print(f'✓ Authentication successful for {user_data["username"]}')
        else:
            print(f'✗ Authentication failed for {user_data["username"]}')
    
    print("\nDemo user creation test completed!")

if __name__ == "__main__":
    test_demo_user_creation()
