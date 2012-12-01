app.Models.Network = Backbone.Model.extend({
    urlRoot: function () { return app.restEndpoint + "/network"; },
    defaults: { devices: [], key: "" }
});

app.Models.NetworksCollection = Backbone.Collection.extend({
    url: function () { return app.restEndpoint + "/network"; },
    model: app.Models.Network,
    comparator: function (network) {
        var name = network.get("name");
        if (name)
            return name.toLowerCase();
        else
            return 1000000;
    }
});
