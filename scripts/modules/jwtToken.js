app.module("Modules.JwtToken", function (users, app) {
    var JwtTokenView = new app.Views.JwtToken();
    var controller = {
        'jwttoken_show': function () {
            if ( !app.hasCredentials() ) {
                return;
            }
            app.Regions.bottomWorkArea.close();
            app.vent.trigger("stopLoading");

            app.Regions.topWorkArea.show(JwtTokenView);
        }
    };

    var routes = {
        "jwt-token": "jwttoken_show"
    };

    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });

    app.addInitializer(function (options) {
        var rtr = new router();
    });

    app.bind("initialize:after", function (options) {
        app.vent.trigger("addResource", "jwt-token", "JWT Tokens");
    });
});