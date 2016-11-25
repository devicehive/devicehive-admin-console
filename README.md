DeviceHive Admin Console
=======================================

[DeviceHive]: http://devicehive.com "DeviceHive framework"
[DataArt]: http://dataart.com "DataArt"

This is JavaScript Admin console for manage [DeviceHive] api server.
For more information please see corresponding documentation.


About DeviceHive
----------------

[DeviceHive] turns any connected device into the part of Internet of Things.
It provides the communication layer, control software and multi-platform
libraries to bootstrap development of smart energy, home automation, remote
sensing, telemetry, remote control and monitoring software and much more.
Connect embedded Linux using Python or C++ libraries and JSON protocol or
connect AVR, Microchip devices using lightweight C libraries and BINARY
protocol. Develop client applications using HTML5/JavaScript, iOS and Android
libraries. For solutions involving gateways, there is also gateway middleware
that allows to interface with devices connected to it. Leave communications
to [DeviceHive] and focus on actual product and innovation.

Docker Usage
------------------
Admin Console is a single page application and can be hosted as a set of static files as a part of any other webiste. 
But it can be easily hosted on its own by using docker image `devicehive/admin-console`:
```yml
admin-console:
  image: devicehive/admin-console
  links:
    - "dh"
  ports:
    - "80"

dh:
  image: devicehive/devicehive
  links:
    - "postgres"
    - "kafka"
    - "zookeeper"
  ports:
    - "8080:8080"
  environment:
    DH_POSTGRES_USERNAME: "postgres"
    DH_POSTGRES_PASSWORD: "mysecretpassword"
    DH_POSTGRES_DB: "postgres"


zookeeper:
  image: jplock/zookeeper:3.4.6
  ports:
    - "2181:2181"

kafka:
  image: ches/kafka:0.8.2.1
  links:
    - "zookeeper"
  expose:
    - "9092"

postgres:
  image: postgres:9.4.4
  ports:
    - "5432:5432"
```


DeviceHive license
------------------

[DeviceHive] is developed by [DataArt] Apps and distributed under Open Source
[Apache 2.0](https://en.wikipedia.org/wiki/Apache_License). This basically means
you can do whatever you want with the software as long as the copyright notice
is included. This also means you don't have to contribute the end product or
modified sources back to Open Source, but if you feel like sharing, you are
highly encouraged to do so!

&copy; Copyright 2015 DataArt Apps &copy; All Rights Reserved

