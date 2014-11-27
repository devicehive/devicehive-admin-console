//instantiate application object, set Models, Views, Regions, Modules agregators
var app = new Backbone.Marionette.Application();

_.extend(app, {
    Router: Backbone.Marionette.AppRouter,
    DataCollections: {},
    Models: {},
    Views: {},
    Regions: {},
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
    hasCredentials: function() {
        // if no credentials currently set
        if (!sessionStorage.userLogin || !sessionStorage.userPassword || !sessionStorage.deviceHiveToken) {
            return false;
        } else {
            return true;
        }
    },
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
    app.User = new app.Models.User();
    app.OAuth2 = new app.Models.OAuth2();
});

app.bind("initialize:after", function (options) {
    var params = { root: app.rootUrl };

    if (_.isObject(options)) {
        if (_.has(options, "pushState")) {
            params.pushState = options.pushState;
        }
    }

    if (Backbone.history) {
        Backbone.history.start(params);
    }
    app.trigger('landing');
});

app.bind('landing', function() {
    // check if all required get parameters are specified in request:
    if ( !app.OAuth2.checkParameters() ) {
        app.vent.trigger('notification', app.Enums.NotificationType.Error, {}, 'Incomplete GET parameters');
        return;
    }
    app.OAuth2.getClients();
});

app.bind("login", function (options) {
    app.OAuth2.getGrants();
});

app.bind('needAuth', function(opts) {
    if (sessionStorage.userLogin) {
        delete sessionStorage.userLogin;
    }
    if (sessionStorage.userPassword) {
        delete sessionStorage.userPassword;
    }
    if (sessionStorage.deviceHiveToken) {
        delete sessionStorage.deviceHiveToken;
    }
    Backbone.history.navigate('auth', { trigger: true });
});
