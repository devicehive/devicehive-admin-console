app.Models.AccessKey = Backbone.Model.extend({
    defaults: { },
    parse: function(response, xhr) {
        if (response) {
            response["permissions"] = new app.Models.AccessKeyPermissionsCollection(response["permissions"] || []);
        }
        return response;
    },
    toJSON: function() {
        var json = Backbone.Model.prototype.toJSON.apply(this);
        if (json["permissions"] != null && _.isObject(json["permissions"]) && _.isFunction(json["permissions"]["toJSON"]))
            json["permissions"] = json["permissions"].toJSON();
        return json;
    },
    clone: function() {
        return new this.constructor(this.toJSON(), { parse: true });
    }
});


app.Models.AccessKeysCollection = Backbone.Collection.extend({
    initialize: function (options) {
        if (options && _.has(options, "userId")) {
            this.userId = options.userId;
        }
    },
    url: function () {
        return app.restEndpoint + "/user/" + (this.userId != null ? this.userId : "current") + "/accesskey";
    },
    model: app.Models.AccessKey,
    comparator: function (network) {
        var name = network.get("label");
        if (name)
            return name.toLowerCase();
        else
            return 1000000;
    }
});


app.Models.AccessKeyPermission = Backbone.Model.extend({
    defaults: { }
});

app.Models.AccessKeyPermission.actions =  {
    "GetNetwork": "get information about network",
        "GetDevice": "get information about device and device class",
        "GetDeviceState": "get information about current device equipment state",
        "GetDeviceNotification": "get or subscribe to device notifications",
        "GetDeviceCommand": "get or subscribe to commands sent to device",
        "RegisterDevice": "register a device",
        "CreateDeviceNotification": "post notifications on behalf of device",
        "CreateDeviceCommand": "post commands to device",
        "UpdateDeviceCommand": "update status of commands on behalf of device"
};


app.Models.AccessKeyPermissionsCollection = Backbone.Collection.extend({
    model: app.Models.AccessKeyPermission
});