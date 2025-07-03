import csv
import os
from django.core.management.base import BaseCommand
from django.db import transaction
from djangoapp.models import Product


class Command(BaseCommand):
    help = 'Load products from CSV file into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--csv-path',
            type=str,
            help='Path to the CSV file (default: database/data/Products.csv)',
        )
        parser.add_argument(
            '--clear-existing',
            action='store_true',
            help='Clear existing products before loading new ones',
        )

    def handle(self, *args, **options):
        # Default CSV path
        csv_path = options.get('csv_path')
        if not csv_path:
            csv_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
                'database', 'data', 'Products.csv'
            )

        if not os.path.exists(csv_path):
            self.stdout.write(
                self.style.ERROR(f'CSV file not found: {csv_path}')
            )
            return

        # Clear existing products if requested
        if options.get('clear_existing'):
            Product.objects.all().delete()
            self.stdout.write(
                self.style.WARNING('Cleared all existing products')
            )

        # Load products from CSV
        products_created = 0
        products_updated = 0
        
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            with transaction.atomic():
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
                    
                    # Extract brand from product name if brand field is empty
                    if not brand and product_name:
                        # Try to extract brand from product name
                        words = product_name.split()
                        if len(words) > 0:
                            brand = words[0]
                    
                    # Generate stock quantity (random but realistic)
                    import random
                    stock_quantity = random.randint(5, 200)
                    
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

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully loaded {products_created} new products and updated {products_updated} existing products'
            )
        )
        
        # Show summary
        total_products = Product.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'Total products in database: {total_products}')
        )
