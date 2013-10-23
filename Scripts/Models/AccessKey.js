app.Models.AccessKey = Backbone.Model.extend({
    defaults: { },
    parse: function(response, xhr) {
        if (response) {
            response["permissions"] = new app.Models.AccessKeyPermissionsCollection(response["permissions"] || []);
        }
        return response;
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


app.Models.AccessKeyPermissionsCollection = Backbone.Collection.extend({
    model: app.Models.AccessKeyPermission
});