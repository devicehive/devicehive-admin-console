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