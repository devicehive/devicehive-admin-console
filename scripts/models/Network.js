app.Models.Network = Backbone.AuthModel.extend({
    urlRoot: function () { return app.config.restEndpoint + "/network"; },
    defaults: { devices: [], key: "" }
});

app.Models.NetworksCollection = Backbone.AuthCollection.extend({
    url: function () { return app.config.restEndpoint + "/network"; },
    model: app.Models.Network,
    comparator: function (network) {
        var name = network.get("name");
        if (name)
            return name.toLowerCase();
        else
            return 1000000;
    }
});
