from django.core.management.base import BaseCommand
from djangoapp.models import Product


class Command(BaseCommand):
    help = 'Check product data and provide statistics'

    def handle(self, *args, **options):
        total_products = Product.objects.count()
        
        self.stdout.write(f'📊 Product Database Statistics')
        self.stdout.write('=' * 50)
        self.stdout.write(f'Total Products: {total_products}')
        
        # Category breakdown
        categories = Product.objects.values_list('category', flat=True).distinct()
        category_stats = []
        
        for category in categories:
            count = Product.objects.filter(category=category).count()
            total_stock = Product.objects.filter(category=category).aggregate(
                total=models.Sum('stock_quantity')
            )['total'] or 0
            avg_price = Product.objects.filter(category=category).aggregate(
                avg=models.Avg('price')
            )['avg'] or 0
            
            category_stats.append({
                'category': category or 'Uncategorized',
                'count': count,
                'stock': total_stock,
                'avg_price': avg_price
            })
        
        # Sort by count
        category_stats.sort(key=lambda x: x['count'], reverse=True)
        
        self.stdout.write('\n📋 Category Breakdown:')
        self.stdout.write('-' * 70)
        self.stdout.write(f'{"Category":<20} {"Products":<10} {"Total Stock":<12} {"Avg Price":<10}')
        self.stdout.write('-' * 70)
        
        for stat in category_stats:
            self.stdout.write(
                f'{stat["category"]:<20} '
                f'{stat["count"]:<10} '
                f'{stat["stock"]:<12} '
                f'${stat["avg_price"]:<9.2f}'
            )
        
        # Stock analysis
        out_of_stock = Product.objects.filter(stock_quantity=0).count()
        low_stock = Product.objects.filter(stock_quantity__gt=0, stock_quantity__lte=10).count()
        good_stock = Product.objects.filter(stock_quantity__gt=10).count()
        
        self.stdout.write('\n📦 Stock Analysis:')
        self.stdout.write('-' * 30)
        self.stdout.write(f'Out of Stock: {out_of_stock}')
        self.stdout.write(f'Low Stock (1-10): {low_stock}')
        self.stdout.write(f'Good Stock (>10): {good_stock}')
        
        # Price analysis
        price_stats = Product.objects.aggregate(
            min_price=models.Min('price'),
            max_price=models.Max('price'),
            avg_price=models.Avg('price')
        )
        
        self.stdout.write('\n💰 Price Analysis:')
        self.stdout.write('-' * 30)
        self.stdout.write(f'Minimum Price: ${price_stats["min_price"]:.2f}')
        self.stdout.write(f'Maximum Price: ${price_stats["max_price"]:.2f}')
        self.stdout.write(f'Average Price: ${price_stats["avg_price"]:.2f}')
        
        # Missing data check
        no_image = Product.objects.filter(image_url='').count()
        no_description = Product.objects.filter(description='').count()
        
        if no_image > 0 or no_description > 0:
            self.stdout.write('\n⚠️  Data Quality Issues:')
            self.stdout.write('-' * 30)
            if no_image > 0:
                self.stdout.write(f'Products without images: {no_image}')
            if no_description > 0:
                self.stdout.write(f'Products without descriptions: {no_description}')
        else:
            self.stdout.write('\n✅ Data Quality: All products have images and descriptions')
        
        self.stdout.write('\n🎉 Product database is ready for use!')


# Import models for aggregation
from django.db import models
