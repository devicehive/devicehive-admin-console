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

app.bind('launch', function() {
    console.log('app launch?');
    app.Regions.statusArea.show(new app.Views.authHeader(app.User));
});

app.bind("login", function (options) {
    console.log('login event');
    // fetch current user
    app.User.fetch({ success: function() {
        if (app.User.id != null) {
            app.trigger('launch');
            console.log('trigger navigatedTo');
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
        var context = this;
        function showError(message) {
            context.$el.find('form .error').html(message);
            context.$el.find('form .error').toggleClass('ui-helper-hidden', !message);
        };
        this.$el.find('form').on('submit', function(e) {
            e.preventDefault();
            showError(''); // clear error message
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
                    if (resp.status == 401) {
                        showError('Wrong login or password');
                    } else {
                        showError('Server error: '+resp.responseText);
                    }
                }
            };

            $.ajax(app.Models.User.prototype.urlCurrent(), options);
        });
    }
});



app.Views.authHeader = Backbone.Marionette.ItemView.extend({
    template: 'auth-header',
    initialize: function(user) {
        this.userLogin = user.get('login');
    },
    serializeData: function() {
        return {userLogin: this.userLogin};
    },
    onRender: function() {
        console.log('render auth header');
    },
    events: {
        "click a": "clickHandler"
    },
    clickHandler: function(e) {
        console.log('click handler option %o', e);
        e.preventDefault();
        $el = $(e.target);
        Backbone.history.navigate($el.data('path'), { trigger: true });
    }
});

app.Views.ChangePassword = Backbone.Marionette.ItemView.extend({
    template: 'change-password',
    onRender: function() {
        console.log('render change password');
        var context = this;
        function error(message) {
            context.$el.find('form .error').html(message);
            context.$el.find('form .error').toggleClass('ui-helper-hidden', !message);
        };
        function success(newpassword) {
            context.$el.find('form .success').toggleClass('ui-helper-hidden', !newpassword);
            if (newpassword) {
                sessionStorage.userPassword = newpassword;
                sessionStorage.lastActivity = (new Date()).valueOf();
                context.$el.find('form .fields').hide();
            }
        }

        this.$el.find('form').on('submit', function(e) {
            e.preventDefault();
            console.log('form submit event %o', e);
            var login = sessionStorage.userLogin;
            var $form = $(e.target);
            error(''); // clear error message
            var currentpassword = $form.find('[name=currentpassword]').val();
            var newpassword = $form.find('[name=password]').val();
            var confirmpassword = $form.find('[name=confirmpassword]').val();
            if ( !currentpassword ) {
                error('Please specify current password');
                return;
            }
            if ( !newpassword ) {
                error('Please specify new password');
                return;
            }
            if ( newpassword != confirmpassword ) {
                console.log('newpassword %o, confpassword %o', newpassword, confirmpassword);
                error('New password and confirm password do not match');
                return;
            }
            // perform check of current password
            var headers = {'Authorization': 'Basic '+btoa(login+':'+currentpassword)}; 
            var options = {
                headers: headers,
                success: function(resp, status) {
                    console.log('success %o', resp);
                    // try to set new password
                    $.ajax(app.User.urlCurrent(), {
                        headers: headers,
                        type: 'PUT',
                        data: { password: newpassword },
                        success: function(resp) {
                            console.log('successfully changed password');
                            success(newpassword);
                        },
                        error: function(resp) {
                            console.log('error changing password %o %o', resp, arguments);
                            var responseObject = JSON.parse(resp.responseText);
                            if (responseObject.message) {
                                error(responseObject.message);
                            } else {
                                error('Server error '+resp.status+': '+resp.responseText);
                            }
                        }
                    });
                },
                error: function(resp) {
                    console.log('fail %o', resp);
                    if (resp.status == 401) {
                        error('Current password incorrect');
                    } else {
                        error('Server error');
                    }
                }
            };
            $.ajax(app.User.urlCurrent(), options);
        });
    }
});


app.module("Modules.Login", function (users, app) {
    console.log("Modules.Login users %o, app %o", users, app);
    var loginView = new app.Views.Login();
    var changePasswordView = new app.Views.ChangePassword();

    var controller = {
        'auth': function() {
            if (sessionStorage.userLogin && sessionStorage.userPassword) {
                console.log('auth action redirects to / because there are some credentials');
                Backbone.history.navigate('', {trigger: true});
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
        },
        'changepassword': function() {
            app.Regions.topWorkArea.show(changePasswordView);
        }
    };
    var routes = {
        auth: 'auth',
        logout: 'logout',
        changepassword: 'changepassword'
    };
    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });
    app.addInitializer(function (options) {
        console.log('inited module.login and rtr is started');
        var rtr = new router();
    });

});
