app.Models.AccessKey = Backbone.AuthModel.extend({
    defaults: function() {
        return { permissions: new app.Models.AccessKeyPermissionsCollection() };
    },
    parse: function(response, xhr) {
        if (response && response.permissions) {
            response["permissions"] = new app.Models.AccessKeyPermissionsCollection(response["permissions"]);
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


app.Models.AccessKeysCollection = Backbone.AuthCollection.extend({
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


app.Models.AccessKeyPermission = Backbone.AuthModel.extend({
    defaults: { },
    validate: function() {
        var domainRegexp = /^([0-9a-zA-Z\\-]+\.?)+[0-9a-zA-Z\\-]+$/;
        var subnetRegexp = /^((1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.){3}(1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\/([0-2]?[0-9]|3[0-2])$/;
        var validationError = null;

        // check domains
        var domains = this.get("domains");
        if (domains) {
            for (var i = 0; i < domains.length && !validationError; ++i) {
                validationError = !domainRegexp.test(domains[i]) && (domains[i] + " doesn\'t look like a valid domain name");
            }
        }

        // check subnets
        var subnets = this.get("subnets");
        if (subnets) {
            for (i = 0; i < subnets.length && !validationError; ++i) {
                validationError = !subnetRegexp.test(subnets[i]) && (subnets[i] + " doesn\'t look like a valid subnet");
            }
        }

        return validationError || void 0;
    }
});

app.Models.AccessKeyPermission.actions =  {
    "GetAccessKey": "get information about access key",
    "CreateAccessKey": "create new access key",
    "UpdateAccessKey": "update existing access key",
    "DeleteAccessKey": "delete existing access key",
    "GetDeviceClass": "get information about device class",
    "CreateDeviceClass": "create device class",
    "UpdateDeviceClass": "update device class",
    "DeleteDeviceClass": "delete device class",
    "GetNetwork": "get information about network",
    "AssignNetwork": "assign network to the user",
    "CreateNetwork": "create network",
    "UpdateNetwork": "update network",
    "DeleteNetwork": "delete network",
    "CreateOAuthClient": "create oauth client",
    "UpdateOAuthClient": "update oauth client",
    "DeleteOAuthClient": "delete oauth client",
    "GetOAuthGrant": "get information about oauth grant",
    "CreateOAuthGrant": "create oauth grant",
    "UpdateOAuthGrant": "update oauth grant",
    "DeleteOAuthGrant": "delete oauth grant",
    "GetDevice": "get information about device and device class",
    "DeleteDevice": "delete information about device and device class",
    "GetDeviceState": "get information about current device equipment state",
    "GetDeviceNotification": "get or subscribe to device notifications",
    "GetDeviceCommand": "get or subscribe to commands sent to device",
    "RegisterDevice": "register a device",
    "CreateDeviceNotification": "post notifications on behalf of device",
    "CreateDeviceCommand": "post commands to device",
    "UpdateDeviceCommand": "update status of commands on behalf of device",
    "GetUser": "get information about user",
    "CreateUser": "create user",
    "UpdateUser": "update user",
    "DeleteUser": "delete user"
};


app.Models.AccessKeyPermissionsCollection = Backbone.AuthCollection.extend({
    model: app.Models.AccessKeyPermission
});