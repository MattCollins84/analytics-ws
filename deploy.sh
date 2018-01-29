#!/bin/sh
ssh analytics@10.0.1.94 "cd ~/code/analytics-ws; git pull; npm install; forever restartall;"