app.module("Modules.OAuth2Client", function (users, app) {
    function getOAuth2Clients() {
        var deferred = app.getCollection("OAuthClientsCollection"); 
        return deferred;
    }
    var controller = {
        oauthclient: function() {
            app.Regions.bottomWorkArea.close();
            app.vent.trigger("startLoading");
            $.when(getOAuth2Clients()).done(function(clients) {
                var view = new app.Views.OAuth2Clients({collection: clients});
                app.Regions.topWorkArea.show(view);
                app.vent.trigger("stopLoading");
            });
        }
    };
    var routes = {
        oauthclient: 'oauthclient'
    };
    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });
    app.addInitializer(function (options) {
        var rtr = new router();
    });
    app.bind("login", function (options) {
        app.vent.trigger("addResource", "oauthclient", "OAuth Clients", [ app.Enums.UserRole.Administrator ]);
    });
});