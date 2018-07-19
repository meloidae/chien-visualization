from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.


def index(request):
    return render(request, 'index.html')

def get_tweets(request):
    time_from = request.GET.get('time_from')
    time_to = request.GET.get('time_to')
    return HttpResponse('Hello World!')
