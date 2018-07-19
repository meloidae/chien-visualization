#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys

def CallORMapper():
    sys.path.append('chienviz')
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "chienvizsite.settings")
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()

    from chienviz.models import Test
    #Test(name="foo_and_bar").save()
    objects = Test.objects.all()
    for o in objects:
        print(o.name)

if __name__ == "__main__":
    CallORMapper()
