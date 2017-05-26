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
app.Models.Device = Backbone.AuthModel.extend({
    urlRoot: function () {
         return app.config.restEndpoint + "/device";
     },
     // setStrData: function (value) {
     //     try {
     //         this.set("data", jQuery.parseJSON(value));
     //         return true;
     //     } catch (e) {
     //         app.vent.trigger("notification", app.Enums.NotificationType.Error, "Valid javascript object should be entered");
     //         return false;
     //     }
     // }
});

app.Models.DevicesCollection = Backbone.AuthCollection.extend({
    url: function () {
         return app.config.restEndpoint + "/device";
    },
    model: app.Models.Device,
    comparator: function (device) {
        var name = device.get("name");
        if (device && name)
            return name.toLowerCase();
        else
            return 1000000;
    }
});
