
# Register your models here.
from django.contrib import admin
from .models import UserProfile, Product, Order, Review, SupportTicket, CartItem

admin.site.register(UserProfile)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(Review)
admin.site.register(SupportTicket)
admin.site.register(CartItem)
