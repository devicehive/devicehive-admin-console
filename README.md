DeviceHive Admin Console
=======================================

[DeviceHive]: http://devicehive.com "DeviceHive framework"
[DataArt]: http://dataart.com "DataArt"

This is JavaScript Admin console for managing [DeviceHive] api server.
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

Usage
------------------
Admin Console is a single page application and can be hosted as a set of static files as a part of any other website. 

For example, the Admin Console can be served by nginx by adding the following config to 'nginx.conf' (replace 
$ADMIN_CONSOLE_LOCATION with real values)

```
server {
 
     listen       8081;
     access_log   logs/access.log;
     error_log    logs/error-server.log debug;
 
     location /admin {
         sendfile on;
         root $ADMIN_CONSOLE_LOCATION;
         index index.html;
     }
 
   }
```

Then, open `scripts/config.js` and change the restEndpoint to the location of your DeviceHive Server.


DeviceHive license
------------------

[DeviceHive] is developed by [DataArt] Apps and distributed under Open Source
[Apache 2.0](https://en.wikipedia.org/wiki/Apache_License). This basically means
you can do whatever you want with the software as long as the copyright notice
is included. This also means you don't have to contribute the end product or
modified sources back to Open Source, but if you feel like sharing, you are
highly encouraged to do so!

&copy; Copyright 2015-2017 DataArt Apps &copy; All Rights Reserved

