app.module("Modules.Login", function (users, app) {
    var loginView = new app.Views.Login();
    var controller = {
        'auth': function() {
            app.Regions.bottomWorkArea.close();
            app.vent.trigger("stopLoading");
            if (sessionStorage.userLogin && sessionStorage.userPassword) {
                Backbone.history.navigate('', {trigger: true});
                return;
            } else {
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
        var rtr = new router();
    });

});
