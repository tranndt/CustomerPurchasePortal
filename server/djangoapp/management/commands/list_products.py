from django.core.management.base import BaseCommand
from djangoapp.models import Product


class Command(BaseCommand):
    help = 'List products in the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Number of products to display (default: 10)',
        )

    def handle(self, *args, **options):
        limit = options.get('limit', 10)
        
        total_products = Product.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'Total products in database: {total_products}')
        )
        
        if total_products == 0:
            self.stdout.write(
                self.style.WARNING('No products found in the database')
            )
            return
        
        products = Product.objects.all()[:limit]
        
        self.stdout.write('\nProduct List:')
        self.stdout.write('-' * 80)
        
        for i, product in enumerate(products, 1):
            self.stdout.write(
                f'{i:2d}. {product.name[:50]:<50} | '
                f'{product.category:<15} | '
                f'${product.price:>8.2f} | '
                f'Stock: {product.stock_quantity:>3d}'
            )
        
        if total_products > limit:
            self.stdout.write(f'\n... and {total_products - limit} more products')
        
        # Show category breakdown
        self.stdout.write('\nCategory Breakdown:')
        self.stdout.write('-' * 40)
        categories = Product.objects.values_list('category', flat=True).distinct()
        for category in categories:
            count = Product.objects.filter(category=category).count()
            self.stdout.write(f'{category:<20}: {count:>3d} products')
