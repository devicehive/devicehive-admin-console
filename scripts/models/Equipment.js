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
app.Models.Equipment = Backbone.AuthModel.extend({
    initialize: function (attributes, options) {
        if (!_.isUndefined(attributes) && _.has(attributes, "deviceClass")) {
            this.deviceClass = attributes.deviceClass;
        } else if (!_.isUndefined(options) && _.has(options, "deviceClass")) {
            this.deviceClass = options.deviceClass;
        } else if (!_.isUndefined(this.collection) && _.has(this.collection, "deviceClass")) {
            this.deviceClass = this.collection.deviceClass;
        } else {
            var err = new Error("Device class should be specified to define equipment endpoint");
            err.name = "Equipment without device error";
            throw err;
        }
    },
    urlRoot: function () {
        return app.config.restEndpoint + '/device/class/' + this.deviceClass.get("id") + "/equipment";
    },
    setStrData: function (value) {
        try {
            this.set("data", jQuery.parseJSON(value));
            return true;
        } catch (e) {
            app.vent.trigger("notification", app.Enums.NotificationType.Error, "Valid javascript object should be entered");
            return false;
        }
    }
});

app.Models.EquipmentsCollection = Backbone.AuthCollection.extend({
    initialize: function (attributes, options) {
        if (!_.isUndefined(attributes) && _.has(attributes, "deviceClass")) {
            this.deviceClass = attributes.deviceClass;
        } else if (!_.isUndefined(options) && _.has(options, "deviceClass")) {
            this.deviceClass = options.deviceClass;
        } else {
            var err = new Error("Device class should be specified to define equipments endpoint");
            err.name = "Equipment collection without device error";
            throw err;
        }
    },
    url: function () {
        return app.config.restEndpoint + '/device/class/' + this.deviceClass.get("id") + "/equipment";
    },
    //override fetch to make got the list of equipment throught the DeviceClass endpoint
    fetch: function (options) {
        options = options ? _.clone(options) : {};
        if (options.parse === undefined) options.parse = true;
        var collection = this;
        var success = options.success;
        

        var model = new app.Models.DeviceClass({ id: this.deviceClass.get("id") });
        
        options.success = function(resp, status, xhr) {
            if (!model.set(model.parse(resp, xhr), options)) return false;
            collection.reset();

            var addIt = collection.parse(model.get("equipment"));
            if (!_.isUndefined(addIt))
                collection.add(addIt);

            if (success) success(collection, resp);
        };

        options.error = Backbone.wrapError(options.error, collection, options);
        return (this.sync || Backbone.sync).call(this, 'read', model, options);
    },
    model: app.Models.Equipment,
    comparator: function (equip) {
        var name = equip.get("name");
        if (name)
            return name.toLowerCase();
        else
            return 1000000;
    }
});
