#!/bin/sh
docker stop websocks
docker rm websocks
docker run \
	-d -p 8000:8000 \
	--name=websocks \
	-p 49059-49060:49059-49060 \
	--restart=always dev_one
