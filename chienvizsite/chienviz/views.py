from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import datetime, json
from .models import Tweet, TrainTrouble

# Create your views here.


def index(request):
    return render(request, 'index.html')

def get_train_info(request):
    data = request.GET;
    # time_from = request.GET.get('time_from')
    # time_to = request.GET.get('time_to')
    dt_from = datetime.datetime(year=int(data['year_from']),
            month=int(data['month_from']), day=int(data['date_from']),
            hour=int(data['hours_from']), minute=int(data['minutes_from']))
    dt_to = datetime.datetime(year=int(data['year_to']),
            month=int(data['month_to']), day=int(data['date_to']),
            hour=int(data['hours_to']), minute=int(data['minutes_to']), second=59, microsecond=999999)
    
    # Filter tweets
    tweet_list = []
    tweets = Tweet.objects.filter(
            created_at__gte=dt_from
    ).filter(
            created_at__lte=dt_to
    )
    for tweet in tweets:
        id_str = tweet.tweet_id
        stations = tweet.stations
        lines = tweet.lines
        tweet_list.append({
            'id_str': id_str,
            'stations': stations,
            'lines': lines,
        })

    # Filter train trouble
    trouble_list = []
    troubles = TrainTrouble.objects.filter(
            created_at__gte=dt_from
    ).filter(
            created_at__lte=dt_to
    )
    for trouble in troubles:
        trouble_list.append({
            'lines': trouble.lines,
        })

    data = {
        'tweets': tweet_list,
        'troubles': trouble_list
    }


    return JsonResponse(data)
