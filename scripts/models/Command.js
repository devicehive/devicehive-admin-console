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
app.Models.Command = Backbone.AuthModel.extend({
    initialize: function (attributes, options) {
        if (!_.isUndefined(attributes) && _.has(attributes, "device")) {
            this.device = attributes.device;
        }
        else if (!_.isUndefined(options) && _.has(options, "device")) {
            this.device = options.device;
        } else if (!_.isUndefined(this.collection) && _.has(this.collection, "device")) {
            this.device = this.collection.device;
        } else {
            var err = new Error("Device should be specified to define device command endpoint");
            err.name = "Command without device error";
            throw err;
        }

        if (!_.has(attributes, "timestamp")) {
            this.set("timestamp", (new Date().getTime()));
        }
    },
    urlRoot: function () {
        return app.config.restEndpoint + '/device/' + this.device.get("id") + "/command";
    },
    copyIt: function () {
        var fields = {
            command: this.get("command"),
            parameters: this.get("parameters")
        };
        return new app.Models.Command(fields, { device: this.device });
    },
    setStrParameters: function (value) {
        try {
            this.set("parameters", jQuery.parseJSON(value));
            return true;
        } catch (e) {
            app.vent.trigger("notification", app.Enums.NotificationType.Error, "Valid javascript object should be entered");
            return false;
        }
    }
});

app.Models.CommandsCollection = Backbone.AuthCollection.extend({
    initialize: function (attributes, options) {
        if (!_.isUndefined(attributes) && _.has(attributes, "device")) {
            this.device = attributes.device;
        }
        else if (!_.isUndefined(options) && _.has(options, "device")) {
            this.device = options.device;
        } else {
            var err = new Error("Device should be specified to define device command endpoint");
            err.name = "Command without device error";
            throw err;
        }

    },
    url: function () {
        return app.config.restEndpoint + '/device/' + this.device.get("id") + "/command?take=100&sortOrder=DESC";
    },
    parse: function (resp, xhr) {
        // reverse items order back to ascending
        return resp.reverse();
    },
    closePolling: function () {
        if (!_.isEmpty(this.jqXhr)) {
            this.deleted = true;
            this.jqXhr.abort("user initiated abort");
        }
    },
    //start polling updates from the server and add them to collection
    pollUpdates: function () {
        var pollUrl = app.config.restEndpoint + "/device/" + this.device.get("id") + "/command/poll";
        var that = this;
        this.deleted = false;

        var timestamp = app.f.getMaxTimeMicro(this.pluck("timestamp"));

        this.jqXhr = $.ajax({
            url: pollUrl,
            dataType: "json",
            data: { timestamp: timestamp },
            headers: Backbone.AuthModel.prototype.authHeader(),
            success: function (data) {
                _.each(data, function (incomingCommand) {
                    that.add(new app.Models.Command(incomingCommand, { device: that.device }));
                });
            },
            complete: function (xhr) {
                // prevent polling if error occur
                if (xhr.status >= 400) {
                    app.vent.trigger("notification", app.Enums.NotificationType.Error, xhr);
                    // return BEFORE running pollUpdates again
                    return;
                }
                if (that.deleted == false)
                    that.pollUpdates();
            },
            timeout: 30000
        });
    },
    model: app.Models.Command
});
