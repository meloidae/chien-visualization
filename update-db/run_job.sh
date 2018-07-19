#!/bin/bash

. /home/dbclass/.bashrc
cd /home/dbclass/chien-viz/update-db
. activate py3-django
python update_db.py

