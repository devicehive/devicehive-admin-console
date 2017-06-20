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
    isLoggedIn: function () {
        this.checkSession();
        return app.User;// && !app.User.isNew();
    },
    checkSession: function() {
        if (localStorage.deviceHiveToken) {
            var currentJwtToken = this.parseJwt(localStorage.deviceHiveToken);
            var expirationTokenTime = currentJwtToken.payload.expiration;
            var currentTime = (new Date()).valueOf();

            var msDateDiff = expirationTokenTime - currentTime;
            var mDateDiff = Math.floor(msDateDiff / 1000 / 60);

            if (mDateDiff < (Math.floor(app.config.sessionLifeTimeRatio * app.config.sessionLifeTime))) {
                console.log("Tokens were refreshed");
                var JWTTokenModel = new app.Models.JwtToken();
                JWTTokenModel.refreshJwtToken();
            }
        }
    },
    disableNewUserHints: function() {
        app.User.disableHints();
    },
    parseJwt: function (token) {
        if(token) {
            return jwt_decode(token);
        }
    },
    isJson: function(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },
    hasCredentials: function () {
        return (localStorage.deviceHiveToken) ? true : false;
    },

    isAdmin: function(token) {
        if (token) {
            var userData = app.parseJwt(token);
            return (userData.payload.actions[0] === '*');
        }
    },
    // checks whether app.User has access to specified role
    hasRole: function (roles) {
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
});

app.bind("initialize:after", function (options) {
    $("#error-empty-page").hide();
    app.User = new app.Models.User();

    setTimeout(function () {
        localStorage.introReviewed = app.User.attributes.introReviewed;
    }, 1000);
    var params = {root: app.config.rootUrl};

    if (_.isObject(options)) {
        if (_.has(options, "pushState")) {
            params.pushState = options.pushState;
        }
    }


    if (Backbone.history) {
        Backbone.history.start(params);

        if (location.search) {
            localStorage.clear();
            var query = app.f.parseQueryString(location.search);
            console.log('Detected starting query', query);

            if (query.deviceHiveToken) {
                localStorage.deviceHiveToken = query.deviceHiveToken;
                localStorage.lastActivity = (new Date()).valueOf();
                delete sessionStorage.authenticationError;
                delete query.deviceHiveToken;
                // remove ath token from query string by recreating url without that parameter
                history.replaceState(null, null, '?' + app.f.formatQueryString(query) + location.hash);
            }
        }


        if (this.hasCredentials()) {
            app.trigger('login');
        } else {
            app.trigger('needAuth');
        }
    }
});

app.bind('launch', function () {
    app.Regions.statusArea.show(new app.Views.authHeader({user: app.User}));
});

app.bind("login", function (options) {
    // fetch current user
    app.User.fetch({
        success: function () {
            if (app.User.id != null) {
                app.trigger('launch');
                var target = Backbone.history.fragment;
                if (sessionStorage && sessionStorage.requestFragment) {
                    target = sessionStorage.requestFragment;
                    delete sessionStorage.requestFragment;
                }

                if (localStorage.deviceHiveToken && !localStorage.deviceHiveRefreshToken) {
                    var JWTTokenModel = new app.Models.JwtToken();
                    if (!this.userData) {
                        this.userData = app.parseJwt(localStorage.deviceHiveToken);
                    }
                    this.userData.payload.expiration = this.expirationTokenDate;
                    JWTTokenModel.generateDeviceJwtTokens(this.userData.payload, function(tokens) {
                        localStorage.deviceHiveRefreshToken = tokens.refreshToken;
                    });
                }

                Backbone.history.navigate(target, {trigger: true});
            }
        },
        error: function (child, reply, obj) {
            console.warn('init:after error, reply %o, this %o, obj %o', reply, this, obj);
            if (reply.status == 401) {
                app.trigger('needAuth', reply);
            } else {
                delete localStorage.deviceHiveToken;
                delete localStorage.introReviewed;
                Backbone.history.navigate('', {trigger: false});
                location.reload(true);
            }
        }
    });
});

app.bind('needAuth', function (opts) {
    Backbone.history.navigate('auth', {trigger: true});
});
