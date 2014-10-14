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
    hasCredentials: function() {
        // if no credentials currently set
        if (!sessionStorage.userLogin || !sessionStorage.userPassword) {
            return false;
        } else {
            console.log('lets think that we have credentials');
            return true;
        }
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
    app.User = new app.Models.User();
    var params = { root: app.rootUrl };

    if (_.isObject(options)) {
        if (_.has(options, "pushState")) {
            params.pushState = options.pushState;
        }
    }


    if (Backbone.history) {
        Backbone.history.start(params);
        if (this.hasCredentials()) {
            app.trigger('login');
        } else {
            app.trigger('needAuth');
        }
    }
});

app.bind("login", function (options) {
    console.log('login event');
    // fetch current user
    app.User.fetch({ success: function() {
        if (app.User.id != null) {
            Backbone.history.trigger("navigatedTo", Backbone.history.getFragment());
        }
    },
    error: function(child, reply, obj) {
        console.warn('init:after error, reply %o, this %o, obj %o', reply, this, obj);
        if (reply.status == 401) {
            console.log('need auth');
            app.trigger('needAuth', reply);
        }
    }});
});

app.bind('needAuth', function(opts) {
    console.log('needAuth method bind');
    Backbone.history.navigate('auth', { trigger: true });
});

app.Views.Login = Backbone.Marionette.ItemView.extend({
    template: 'user-login',
    onRender: function() {
        console.log('render login view this %o, el, %o', this, this.$el);
        this.$el.find('form').on('submit', function(e) {
            e.preventDefault();
            console.log('form submit event %o', e);
            var login = $(e.target).find('[name=login]').val();
            var password = $(e.target).find('[name=password]').val();
            console.log('login %o pass %o', login, password);
            var options = {
                headers: {'Authorization': 'Basic '+btoa(login+':'+password)},
                success: function(resp, status) {
                    console.log('success %o', resp);
                    sessionStorage.userLogin=login;
                    sessionStorage.userPassword=password;
                    sessionStorage.lastActivity=(new Date()).valueOf();
                    Backbone.history.navigate('', { trigger: false });
                    location.reload(true);
                },
                error: function(resp, status) {
                    console.log('fail %o', resp);
                    if (status == 401) {
                        alert('Invalid login or password');
                    } else {
                        alert('Server error');
                    }
                }
            };

            $.ajax(app.Models.User.prototype.urlCurrent(), options);
        });
    }
});


app.module("Modules.Login", function (users, app) {
    console.log("Modules.Login users %o, app %o", users, app);
    var loginView = new app.Views.Login();

    var controller = {
        'auth': function() {
            if (sessionStorage.userLogin && sessionStorage.userPassword) {
                console.log('auth action redirects to / because there are some credentials');
                Backbone.history.navigate('', {trigger: false});
                return;
            } else {
                console.log('credentials incomplete or missing');
                app.Regions.topWorkArea.show(loginView);
            }
        },
        'logout': function() {
            delete sessionStorage.userLogin;
            delete sessionStorage.userPassword;
            Backbone.history.navigate('', { trigger: false });
            location.reload(true);
        }
    };
    var routes = {
        auth: 'auth',
        logout: 'logout'
    };
    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });
    app.addInitializer(function (options) {
        console.log('inited module.login and rtr is started');
        var rtr = new router();
    });
    app.bind("initialize:after", function () {
        app.vent.trigger("addResource", "auth", "Login", []);
    });

});
