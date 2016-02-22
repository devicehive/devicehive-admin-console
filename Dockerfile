FROM phusion/passenger-nodejs:0.9.18

# configured according to https://github.com/phusion/passenger-docker

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# enable nginx
RUN rm -f /etc/service/nginx/down

# Remove the default site
RUN rm /etc/nginx/sites-enabled/default

# copy admin console website files
RUN mkdir /home/app/adminconsole
ADD css /home/app/adminconsole/css
ADD scripts /home/app/adminconsole/scripts
ADD index.html /home/app/adminconsole/
ADD favicon.ico /home/app/adminconsole/
RUN chown -R app:app /home/app/adminconsole

# tweak nginx
ADD docker/nginx.conf /etc/nginx/conf.d/nginx.conf
ADD docker/env.conf /etc/nginx/main.d/env.conf

# register website in nginx
ADD docker/adminconsole.conf /etc/nginx/sites-enabled/adminconsole.conf
