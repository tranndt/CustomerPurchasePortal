#!/usr/bin/env python3
"""
Test script to verify React build exists and Django can serve it correctly.
This helps debug production issues locally.
"""

import os
import sys
from pathlib import Path

# Add the server directory to the path so we can import Django modules
server_dir = os.path.join(os.path.dirname(__file__), 'server')
sys.path.insert(0, server_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings')

import django
django.setup()

from django.conf import settings
from djangoapp.views import home
from django.http import HttpRequest

def test_react_build():
    """Test if React build exists and can be served."""
    print("Testing React build availability...")
    print(f"Django BASE_DIR: {settings.BASE_DIR}")
    
    # Check possible React build locations
    possible_paths = [
        os.path.join(settings.BASE_DIR, 'frontend', 'build', 'index.html'),
        os.path.join(os.path.dirname(__file__), 'server', 'frontend', 'build', 'index.html'),
    ]
    
    found_build = False
    for path in possible_paths:
        print(f"Checking: {path}")
        if os.path.exists(path):
            print(f"✓ React build found at: {path}")
            print(f"  File size: {os.path.getsize(path)} bytes")
            found_build = True
            
            # Check if it looks like a valid React build
            with open(path, 'r') as f:
                content = f.read()
                if 'react' in content.lower() or 'root' in content:
                    print("  ✓ Content looks like a React build")
                else:
                    print("  ⚠ Content doesn't look like a React build")
            break
        else:
            print(f"  ✗ Not found")
    
    if not found_build:
        print("✗ No React build found!")
        print("\nTo create a React build:")
        print("cd server/frontend && npm run build")
        return False
    
    # Test Django home view
    print("\nTesting Django home view...")
    try:
        request = HttpRequest()
        request.path = '/'
        request.method = 'GET'
        response = home(request)
        
        if response.status_code == 200:
            content_type = response.get('content-type', '')
            if 'text/html' in content_type:
                print("✓ Django home view returns HTML (React build)")
                return True
            else:
                print(f"✗ Django home view returns {content_type} (API fallback)")
                return False
        else:
            print(f"✗ Django home view returned status {response.status_code}")
            return False
    
    except Exception as e:
        print(f"✗ Error testing Django home view: {e}")
        return False

if __name__ == '__main__':
    success = test_react_build()
    sys.exit(0 if success else 1)
