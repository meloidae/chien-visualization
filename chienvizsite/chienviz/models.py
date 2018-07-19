from django.db import models
from datetime import datetime
import ast

# Create your models here.

class ListField(models.TextField):
    # __metaclass__ = models.SubfieldBase
    description = "Stores a python list"

    def __init__(self, *args, **kwargs):
        super(ListField, self).__init__(*args, **kwargs)

    def from_db_value(self, value, expression, connection):
        if not value:
            value = []
        # if isinstance(value, list):
        #     return value
        return ast.literal_eval(value)

    def to_python(self, value):
        if not value:
            value = []

        if isinstance(value, list):
            return value

        return ast.literal_eval(value)

    def get_prep_value(self, value):
        if value is None:
            return value

        return str(value)

    def value_to_string(self, obj):
        value = self._get_val_from_obj(obj)
        return self.get_db_prep_value(value)

# class TrainInfo(models.Model):
#     stations = models.TextField(default="")
#     lines = models.TextField(default="")
#     status = models.TextField(default="")

class Tweet(models.Model):
    tweet_id = models.CharField(default="", max_length=20)
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    #urls = ListField(blank=True)
    text = models.TextField(default="")
    stations = ListField(blank=True)
    lines = ListField(blank=True)
    #status = models.CharField(default="", max_length=25)

class TrainTrouble(models.Model):
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    line = models.CharField(default="", max_length=20);


# class Test(models.Model):
#     name = models.TextField(default="test_name", blank=False)
