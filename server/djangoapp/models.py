# from django.db import models
# from django.utils.timezone import now
# from django.core.validators import MaxValueValidator, MinValueValidator


from django.db import models

class CarMake(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name

class CarModel(models.Model):
    SEDAN = 'Sedan'
    SUV = 'SUV'
    WAGON = 'Wagon'
    TYPES = [(SEDAN, 'Sedan'), (SUV, 'SUV'), (WAGON, 'Wagon')]

    name = models.CharField(max_length=100)
    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=TYPES)
    year = models.IntegerField()
    dealer_id = models.IntegerField()

    def __str__(self):
        return f"{self.car_make.name} {self.name} ({self.year})"


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

    def __str__(self):
        return f"{self.name} - {self.category}"

class Order(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    date_purchased = models.DateField()
    transaction_id = models.CharField(max_length=100)

    def __str__(self):
        return f"Order {self.transaction_id} by {self.customer.username}"

class Review(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    review_text = models.TextField()
    rating = models.IntegerField()
    sentiment = models.CharField(max_length=10, default='neutral')
    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'product')  # One review per product per customer

    def __str__(self):
        return f"{self.customer.username} review on {self.product.name}"

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
