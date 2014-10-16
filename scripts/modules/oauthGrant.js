app.module("Modules.OAuth2Grant", function (users, app) {
    var controller = {
        grant: function() {
            var networksCollection = new app.Models.NetworksCollection();
            networksCollection.fetch();
            var view = new app.Views.OAuth2IssueGrant({oauth: app.OAuth2, networksCollection: networksCollection});
            app.Regions.topWorkArea.show(view);
        }
    };
    var routes = {
        grant: 'grant'
    };
    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });
    app.addInitializer(function (options) {
        var rtr = new router();
    });
});