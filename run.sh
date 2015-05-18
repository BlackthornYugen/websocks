#!/bin/sh
WEB_PORT=49059
DEBUG_PORT=49060
HTTP_PORT=8000

docker stop websocks
docker rm websocks
docker run \
	-d --name=websocks \
	-p $HTTP_PORT:$HTTP_PORT \
	-e PORT=$HTTP_PORT \
	-p $WEB_PORT:$WEB_PORT \
	-e node-inspector_web-port=${WEB_PORT} \
	-p $DEBUG_PORT:$DEBUG_PORT \
	-e node-inspector_debug-port=${DEBUG_PORT} \
	--restart=always dev_one $1
