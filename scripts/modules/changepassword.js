app.module("Modules.ChangePassword", function (users, app) {
    var changePasswordView = new app.Views.ChangePassword();
    var controller = {
        'changepassword': function() {
            app.Regions.topWorkArea.show(changePasswordView);
            app.Regions.bottomWorkArea.close();
        }
    };
    var routes = {
        changepassword: 'changepassword'
    };
    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });
    app.addInitializer(function (options) {
        var rtr = new router();
    });
});