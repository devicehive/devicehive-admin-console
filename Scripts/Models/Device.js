app.Models.Device = Backbone.Model.extend({
    urlRoot: function () {
         return app.restEndpoint + "/device";
    }
});

app.Models.DevicesCollection = Backbone.Collection.extend({
    url: function () {
         return app.restEndpoint + "/device";
    },
    model: app.Models.Device,
    comparator: function (device) {
        var name = device.get("name");
        if (device)
            return name.toLowerCase();
        else
            return 1000000;
    }
});
