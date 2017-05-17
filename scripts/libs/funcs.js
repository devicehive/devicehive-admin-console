/*
  DeviceHive Admin Console business logic

  Copyright (C) 2016 DataArt

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */
Backbone.Marionette.Application.prototype.f = {
    //gets the list of time strings(with microseconds) and return the maximum
    getMaxTimeMicro: function (list) {
        if (!_.isArray(list)) return "";

        //convert to tics and add the microseconds. 
        //Map to a list of objects {value:integerRepresentation,str:strignRepresentation} 
        //If some empty values occures return null
        var intAndStr = _.map(list, function (curStamp) {
            if (_.isString(curStamp)) {
                var index = curStamp.length;
                return { value: parseInt(Backbone.Marionette.Application.prototype.f.parseUTCstring(curStamp).getTime() + curStamp.substring(index - 3, index)), str: curStamp };
            }
            else return null;
        });

        //compare by integers
        var timestamp = _.max(intAndStr, function (timeObj) {
            if (_.isNull(timeObj)) return 0;
            else return timeObj.value;
        });


        if (_.isEmpty(timestamp)) return "";
        else return timestamp.str;
    },
    //use for utc-formatted strings
    parseUTCstring: function (datetimeString) {
        return new Date(Date.UTC(datetimeString.substring(0, 4),
                        parseInt(datetimeString.substring(5, 7),10) - 1,
                        datetimeString.substring(8, 10),
                        datetimeString.substring(11, 13),
                        datetimeString.substring(14, 16),
                        datetimeString.substring(17, 19),
                        datetimeString.substring(20, 23)));
    },
    parseISOLocal: function (s) {
  	  var b = s.split(/\D/);
  	  return new Date(b[0], b[1]-1, b[2], b[3], b[4], b[5]);
    },
    toISOString: function (date) {
        return date.format(dateFormat.masks.isoUtcDateTime);
    },
    prepareAbsolutePath: function(path) {
        if (path.substr(0,2) === "//") {
            return location.protocol + path;
        } else if (path.substr(0,1) === "/") {
            return location.origin + path;
        } else {
            return path;
        }
    },
    getRedirectUri: function() {
        if (app.config.redirectUri) {
            return app.f.prepareAbsolutePath(app.config.redirectUri);
        } else {
            if (app.config.rootUrl) {
                return app.f.prepareAbsolutePath(app.config.rootUrl);
            } else {
                return location.origin;
            }
        }
    },
    parseQueryString: function (queryString) {
        res = {};
        queryString.replace("?","").split('&').map(
            function (q) {
                var v = q.split('=');
                res[decodeURIComponent(v[0])] = decodeURIComponent(v[1]);
            });
        return res;
    },
    formatQueryString: function (obj) {
        var str = [];
        for(var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }
};

Date.prototype.addDays = function (days) {
    var newDate = (new Date(this).getTime()) + days * 86400000;
    return new Date(newDate);
};