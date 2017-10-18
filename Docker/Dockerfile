FROM nginx:alpine

MAINTAINER devicehive

ARG SOURCE_REPOSITORY_URL
ARG SOURCE_BRANCH

#installing devicehive admin console
RUN apk add --no-cache curl \
    && mkdir -p /opt/devicehive/admin \
    && cd /opt/devicehive/admin \
    && curl -L "${SOURCE_REPOSITORY_URL:-https://github.com/devicehive/devicehive-admin-console}/archive/${SOURCE_BRANCH:-stable}.tar.gz" | tar -xzf - --strip-components=1 \
    && sed -i -e 's/authRestEndpoint.*/authRestEndpoint: location.origin +  \"\/auth\/rest\"\,/' /opt/devicehive/admin/scripts/config.js \
    && sed -i -e 's/restEndpoint.*/restEndpoint: location.origin +  \"\/api\/rest\"\,/' /opt/devicehive/admin/scripts/config.js \
    && apk del curl

COPY admin-start.sh /opt/devicehive/
COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /opt/devicehive/

EXPOSE 8080

ENTRYPOINT ["/bin/sh"]

CMD ["./admin-start.sh"]
