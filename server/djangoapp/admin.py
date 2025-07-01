
# Register your models here.
from django.contrib import admin
from .models import CarMake, CarModel

admin.site.register(CarMake)
admin.site.register(CarModel)

from django.contrib import admin
from .models import UserProfile, Product, Order, Review, SupportTicket

admin.site.register(UserProfile)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(Review)
admin.site.register(SupportTicket)


# CarModelInline class

# CarModelAdmin class

# CarMakeAdmin class with CarModelInline

