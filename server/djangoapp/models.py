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

