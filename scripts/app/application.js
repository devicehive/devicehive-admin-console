//instantiate application object, set Models, Views, Regions, Modules agregators
var app = new Backbone.Marionette.Application();

_.extend(app, {
    Router: Backbone.Marionette.AppRouter,
    DataCollections: {},
    Models: {},
    Views: {},
    Regions: {},
    User: null,
    // override addRegion function to attach new regions
    addRegions: function (regions) {
        var regionValue, regionObj, region;

        for (region in regions) {
            if (regions.hasOwnProperty(region)) {
                regionValue = regions[region];

                if (typeof regionValue === "string") {
                    regionObj = new Backbone.Marionette.Region({
                        el: regionValue
                    });
                } else {
                    regionObj = new regionValue();
                }

                this.Regions[region] = regionObj;
            }
        }
    },
    //to cache the collections of data, that expected to be used in several places in application
    getCollection: function (type, options) {
        var retIt = $.Deferred();

        var optionsHash = options != null && JSON.stringify(options) || "";
        var key = type + optionsHash;

        if (_.isFunction(this.Models[type]) && this.DataCollections[key] == null) {
            this.DataCollections[key] = new this.Models[type](options);
            var that = this;
            this.DataCollections[key].fetch({
                success: function () {
                    retIt.resolve(that.DataCollections[key]);

                },
                error: function (obj, xhr) {
                    app.vent.trigger("notification", app.Enums.NotificationType.Error, xhr);
                    that.DataCollections[key] = null;
                    retIt.resolve(that.DataCollections[key]);

                }
            });
        }
        else {
            retIt.resolve(this.DataCollections[key]);
        }

        return retIt;
    },
    // checks whether app.User is populated
    isLoggedIn: function() {
        return app.User && !app.User.isNew();
    },
    // checks whether app.User has access to specified role
    hasRole: function(roles) {
        if (!this.isLoggedIn())
            return false;

        if (roles == null)
            return true;

        if (_.isArray(roles))
            return _.indexOf(roles, app.User.get("role")) != -1;

        return roles == app.User.get("role");
    }
});

app.bind("initialize:before", function (options) {
    app.restEndpoint = "";
    if (_.isObject(options)) {
        if (_.has(options, "rootUrl")) {
            app.rootUrl = options.rootUrl;
        }
        if (_.has(options, "restEndpoint")) {
            var val = options.restEndpoint;
            if (val.length != 0 && (val.lastIndexOf("/") + 1) == val.length)
                val = val.substr(0, val.length - 1);

            app.restEndpoint = val;
        }
    }
});

app.bind("initialize:after", function (options) {
    // fetch current user
    (app.User = new app.Models.User()).fetch({ success: function() {
        if (app.User.id != null)
            app.trigger("login", options);
    }});
});

app.bind("login", function (options) {
    var params = { root: app.rootUrl };

    if (_.isObject(options)) {
        if (_.has(options, "pushState")) {
            params.pushState = options.pushState;
        }
    }

    if (Backbone.history) {
        Backbone.history.start(params);
        Backbone.history.trigger("navigatedTo", Backbone.history.getFragment());
    }
});
