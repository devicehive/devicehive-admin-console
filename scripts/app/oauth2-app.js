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
        if (!sessionStorage.userLogin || !sessionStorage.userPassword) {
            return false;
        } else {
            console.log('lets think that we have correct credentials');
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

app.Models.OAuth2Model = Backbone.Model.extend({
    getUrlParam: function(name) {
        return decodeURIComponent(((RegExp(name + '=' + '(.+?)(&|$)', 'i').exec(location.search) || [, ""])[1]).replace(/\+/g,' '));
    },
    initialize: function() {
        this.set('client_id', this.getUrlParam("client_id"));
        this.set('redirect_uri', this.getUrlParam("redirect_uri"));
        this.set('response_type', this.getUrlParam("response_type"));
        this.set('scope', this.getUrlParam("scope"));
        this.set('state', this.getUrlParam("state"));
        this.set('access_type', this.getUrlParam("access_type") == "offline" ? "Offline" : "Online");
    },
    checkParameters: function() {
        var p = this.attributes;
        return p.client_id && p.redirect_uri && p.response_type && p.scope;
    },
    authRequest: function(options) {
        var opts = _.extend(this.defaultRequest, options, {headers: Backbone.AuthModel.prototype.authHeader()});
        console.log('making auth request with opts %o', opts);
        $.ajax(opts);
    },
    defaultRequest: {
        type: 'GET',
        cache: false,
    },
    getUrl: function(part) {
        return app.restEndpoint+part;
    },
    checkUser: function() {
        if (app.hasCredentials()) {
            app.trigger('login');
        } else {
            app.trigger('needAuth');
        }
    },
    getClients: function() {
        var options = _.extend(this.defaultRequest, {url: this.getUrl('/oauth/client?oauthId='+this.get('client_id'))});
        var self = this;
        options.success = function(resp) {
            console.log('success %o', resp);
            if (resp[0]) {
                if (resp[0].redirectUri != self.get('redirect_uri')) {
                    console.warn('redirect uri mismatch');
                    return;
                } else {
                    // oauth client exists, let's proceed to user verification
                    self.checkUser(function() {
                        console.log('callback: user checked ok');
                    });
                }
            } else {
                console.warn('No OAuth2 client with id "'+self.get('client_id')+'"');
            }
        };
        options.error = function(resp) {
            console.warn('error %o', resp);
            console.warn('failed to get OAuth2 client');
        };
        $.ajax(options);
    },
    getGrants: function() {
        // type should be capitalized
        var type = this.get('response_type');
        type = type[0].toUpperCase() + type.substring(1);
        var options = _.extend(this.defaultRequest, {
            url: this.getUrl('/user/current/oauth/grant'),
            data: {
                clientOAuthId: this.get('client_id'),
                type: type,
                scope: this.get('scope'),
                redirectUri: this.get('redirect_uri'),
                accessType: this.get('access_type')
            }
        });
        options.success = function(resp) {
            console.log('grants success resp %o', resp);
            if ( !resp[0] ) {
                console.log('navigate to grant screen');
                Backbone.history.navigate('grant', { trigger: true });
            } else {
                console.log('Wow, we already have grants! What to do?');
            }

        };
        options.error = function(resp) {
            console.warn('grants error resp %o', resp);
            app.trigger('needAuth');
        };
        this.authRequest(options);
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
    app.User = new app.Models.User();
    app.OAuth2 = new app.Models.OAuth2Model();
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
    console.log('landing');
    if ( !app.OAuth2.checkParameters() ) {
        console.warn('incomple get parameters');
        return;
    }
    app.OAuth2.getClients();


});

app.bind('launch', function() {
    console.log('app launch?');
});

app.bind("login", function (options) {
    console.log('login event');
    app.OAuth2.getGrants();
});

app.bind('needAuth', function(opts) {
    if (sessionStorage.userLogin) {
        delete sessionStorage.userLogin;
    }
    if (sessionStorage.userPassword) {
        delete sessionStorage.userPassword;
    }
    Backbone.history.navigate('auth', { trigger: true });
});
