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
        return app.User;// && !app.User.isNew();
    },
    hasCredentials: function() {
        // if no credentials currently set
        if (!localStorage.deviceHiveToken) {
            return false;
        } else {
            //console.log('lets think that we have correct credentials');
            return true;
        }
    },
    isOAuthResponse: function() {
        return ('state' === location.hash.substring(1, 6) || 'code' === location.search.substring(1,5)
            || 'state' === location.search.substring(1,6));
    },
    // checks whether app.User has access to specified role
    hasRole: function(roles) {
        if (!this.isLoggedIn()) {
            return false;
        }
        if (roles == null) {
            return true;
        }

        if (_.isArray(roles)) {
            return _.indexOf(roles, app.User.get("role")) != -1;
        }

        return roles == app.User.get("role");
    }
});

app.bind("initialize:before", function (options) {
    var defaultConfig = {
        restEndpoint: "", // should be overriden in config.js
        rootUrl: "", //
        pushState: false, // don't use push state, use hash route instead
        deviceNotificationsNum: 100 // notifications per page
    };

    if (_.isObject(options)) {
        if (_.has(options, "restEndpoint")) {
            var val = options.restEndpoint;
            if (val.length != 0 && (val.lastIndexOf("/") + 1) == val.length) {
                val = val.substr(0, val.length - 1);
            }

            options.restEndpoint = val;
        }
    }
    // merge default options and app.config, store as app.config
    app.config = _.extend(defaultConfig, options);

    var oauthConfig = new app.Models.OAuthConfig().get('providers');
    app.config.googleConfig = oauthConfig.filter(function(element) {return 'google' === element.name})[0];
    app.config.facebookConfig = oauthConfig.filter(function(element) {return 'facebook' === element.name})[0];
    app.config.githubConfig = oauthConfig.filter(function(element) {return 'github' === element.name})[0];
});

app.bind("initialize:after", function (options) {
    app.User = new app.Models.User();
    var params = { root: app.config.rootUrl };

    if (_.isObject(options)) {
        if (_.has(options, "pushState")) {
            params.pushState = options.pushState;
        }
    }


    if (Backbone.history) {
        Backbone.history.start(params);

        if (location.search){
            var query = app.f.parseQueryString(location.search);
            console.log('Detected starting query', query);

            if (query.deviceHiveToken) {
                localStorage.deviceHiveToken=query.deviceHiveToken;
                localStorage.lastActivity=(new Date()).valueOf();
                delete sessionStorage.authenticationError;
                delete query.deviceHiveToken;
                // remove ath token from query string by recreating url without that parameter
                history.replaceState(null, null, '?'+app.f.formatQueryString(query)+location.hash);
            }
        }


        if (this.isOAuthResponse()) {
            app.trigger('oauth');
        } else if (this.hasCredentials()) {
            app.trigger('login');
        } else {
            app.trigger('needAuth');
        }
    }
});

app.bind('launch', function() {
    app.Regions.statusArea.show(new app.Views.authHeader({user: app.User}));
});

app.bind("login", function (options) {
    // fetch current user
    app.User.fetch({ success: function() {
        if (app.User.id != null) {
            app.trigger('launch');
            var target = Backbone.history.fragment;
            if (sessionStorage && sessionStorage.requestFragment) {
                target = sessionStorage.requestFragment;
                delete sessionStorage.requestFragment;
            }
            Backbone.history.navigate(target, {trigger: true});
        }
    },
    error: function(child, reply, obj) {
        console.warn('init:after error, reply %o, this %o, obj %o', reply, this, obj);
        if (reply.status == 401) {
            app.trigger('needAuth', reply);
        }
    }});
});

app.bind('needAuth', function(opts) {
    Backbone.history.navigate('auth', { trigger: true });
});

app.bind("oauth", function(options) {
    var queryString = location.search.substring(1);
    if (!queryString) {
        queryString = location.hash.substring(1);
    }
    var params = app.f.parseQueryString(queryString);
    params.redirect_uri = app.f.getRedirectUri();
    params.providerName = app.f.parseQueryString(params.state).provider;
    delete params.state;
    new app.Models.AccessToken(params);
});
