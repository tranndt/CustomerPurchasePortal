from .models import CarMake, CarModel

def initiate():
    car_make_data = [
        {"name":"NISSAN", "description":"Japanese engineering"},
        {"name":"Toyota", "description":"Reliable vehicles"},
    ]
    car_make_objs = [CarMake.objects.create(**make) for make in car_make_data]

    car_model_data = [
        {"name":"Pathfinder", "type":"SUV", "year":2023, "car_make":car_make_objs[0], "dealer_id":1},
        {"name":"Camry", "type":"Sedan", "year":2023, "car_make":car_make_objs[1], "dealer_id":2},
    ]
    for model in car_model_data:
        CarModel.objects.create(**model)

