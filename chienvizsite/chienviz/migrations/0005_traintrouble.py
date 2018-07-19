# Generated by Django 2.0.7 on 2018-07-19 15:47

import chienviz.models
import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chienviz', '0004_remove_tweet_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrainTrouble',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(blank=True, default=datetime.datetime.now)),
                ('lines', chienviz.models.ListField(blank=True)),
            ],
        ),
    ]