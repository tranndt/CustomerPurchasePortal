from django.db import models
from django.contrib.auth.models import User


# Optional: Extend user with profile for role distinction
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('customer', 'Customer'), 
        ('manager', 'Manager'),
        ('admin', 'Admin'),
        ('support', 'Support')
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class Product(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    stock_quantity = models.IntegerField(default=0)
    image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    def __str__(self):
        return f"{self.name} - {self.category}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'), 
        ('rejected', 'Rejected'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled')
    ]
    
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    date_purchased = models.DateField()
    transaction_id = models.CharField(max_length=100)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_orders')
    processed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Order {self.transaction_id} by {self.customer.username} - {self.status}"

class CartItem(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'product')  # One cart item per product per customer

    @property
    def total_price(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"{self.customer.username}'s cart: {self.quantity}x {self.product.name}"

class Review(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    review_text = models.TextField()
    rating = models.IntegerField()
    sentiment = models.CharField(max_length=10, default='neutral')
    created_on = models.DateTimeField(auto_now_add=True)
    moderated = models.BooleanField(default=False)
    
    # No longer product specific, so we don't need the product field
    # Instead, we'll make sure users can only leave one review per day
    
    class Meta:
        # We don't need unique_together anymore since we'll check date-based restrictions in the view
        ordering = ['-created_on']  # Newest reviews first
    
    def __str__(self):
        return f"{self.customer.username}'s shopping experience review on {self.created_on.strftime('%Y-%m-%d')}"

class SupportTicket(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('resolved', 'Resolved'),
    ]

    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    issue_description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    submitted_on = models.DateTimeField(auto_now_add=True)
    resolution_note = models.TextField(blank=True)
    attachment = models.FileField(upload_to='support_attachments/', blank=True, null=True)

    def __str__(self):
        return f"Ticket #{self.id} by {self.customer.username} on {self.product.name}"
