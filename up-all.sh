#!/bin/bash

if [[ ${1} = "" ]]
then
    echo "You must specify frontend service port."
    exit
fi
if [[ ${2} = "" ]]
then
    echo "You must specify API service port."
    exit
fi
if [[ ${3} = "" ]]
then
    echo "You must specify files service port."
    exit
fi

echo "Frontend port: ${1}"
echo "API port: ${2}"
echo "Files port: ${3}"

frontend_hostname=""
frontend_port=${1}
api_hostname="localhost"
api_port=${2}
api_uri="http://${api_hostname}:${api_port}"
files_port=${3}
files_uri="http://localhost:${files_port}"
postgres_password=default

if [ -f ".env" ]
then
    rm .env
fi
printf "\
FRONTEND_HOSTNAME=${frontend_hostname}\n\
FRONTEND_PORT=${frontend_port}\n\
API_PORT=${api_port}\n\
API_URI=${api_uri}\n\
FILES_PORT=${files_port}\n\
FILES_URI=${files_uri}\n\
POSTGRES_PASSWORD=${postgres_password}\n\
" >> .env

docker compose up -d
