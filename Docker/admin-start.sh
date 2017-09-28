#!/bin/bash -e

set -x

sed -i -e 's/DH_HOST/'"${DH_HOST}"'/' /etc/nginx/nginx.conf
sed -i -e 's/DH_PORT/'"${DH_PORT}"'/' /etc/nginx/nginx.conf
sed -i -e 's/DH_AUTH_HOST/'"${DH_AUTH_HOST}"'/' /etc/nginx/nginx.conf
sed -i -e 's/DH_AUTH_PORT/'"${DH_AUTH_PORT}"'/' /etc/nginx/nginx.conf

nginx -g 'daemon off;'

set +x
