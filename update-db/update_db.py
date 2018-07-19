#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
from datetime import datetime, timedelta
#import pytz
import json
import config, data_dict
import requests
from requests_oauthlib import OAuth1Session

CK = config.CONSUMER_KEY
CS = config.CONSUMER_SECRET
AT = config.ACCESS_TOKEN
ATS = config.ACCESS_TOKEN_SECRET
twitter = OAuth1Session(CK, CS, AT, ATS)

delay_url = "https://rti-giken.jp/fhc/api/train_tetsudo/delay.json"
search_url = "https://api.twitter.com/1.1/search/tweets.json"
search_terms = ["遅延", "人身事故", "見合わせ", "遅れ"]
jst_offset = timedelta(seconds=32400);

def tweet_search(keyword, count=100):
    params = {'q': keyword, 'count': count }
    req = twitter.get(search_url, params = params)
    if req.status_code == 200:
        search_timeline = json.loads(req.text)
        return search_timeline['statuses']
    return []

def tweet_is_valuable(text):
    if "RT" in text:
        return False
    for key, value in data_dict.line_dict.items():
        for line_name in value:
            if line_name in text:
                return True
    for key in data_dict.station_dict:
        if key in text:
            return True
    return False

def tweet_extract_info(text):
    lines = []
    stations = []
    for key, value in data_dict.line_dict.items():
        for line_name in value:
            if line_name in text:
                lines.append(key)
    for key in data_dict.station_dict:
        if key in text:
            stations.append(key)
    return lines, stations

def train_trouble_is_valuable(trouble):
    for key, value in data_dict.company_dict.items():
        if trouble['company'] == key:
            return True
    return False

def train_trouble_get():
    req = requests.get(delay_url);
    if req.status_code == 200:
        train_troubles = json.loads(req.text)
        return train_troubles
    return []
        
def main():
    # Set up for calling django db
    sys.path.append('chienviz')
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "chienvizsite.settings")
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()

    from chienviz.models import Tweet, TrainTrouble
    
    for term in search_terms:
        tweets = tweet_search(term)
        for tweet in tweets:
            # tweet_id
            # created_at
            # text
            # stations
            # lines
            # status
            id_str = tweet['id_str']
            if not Tweet.objects.filter(tweet_id__iexact=id_str).exists():
                text = tweet['text']
                if tweet_is_valuable(text):
                    created_at = tweet['created_at']
                    #print(tweet['user'])
                    #utc_offset = int(tweet['user']['utc_offset'])
                    dt = datetime.strptime(created_at, '%a %b %d %H:%M:%S +0000 %Y')
                    # Set timezone to JST
                    #dt = dt - timedelta(seconds=utc_offset) + jst_offset
                    lines, stations = tweet_extract_info(text)
                    tweet_entry = Tweet(tweet_id=id_str, created_at=dt, text=text,
                            stations=stations, lines=lines)
                    tweet_entry.save()
    troubles = train_trouble_get()
    trouble_lines = []
    for trouble in troubles:
        if train_trouble_is_valuable(trouble):
            for key, value in line_dict:
                line_name = trouble['name']
                if line_name in value:
                    trouble_lines.append(key)

    if len(trouble_lines) > 0:
        trouble_entry = TrainTrouble(created_at=datetime.datetime.now(), lines=trouble_lines)
        trouble_entry.save()


if __name__ == "__main__":
   main()
