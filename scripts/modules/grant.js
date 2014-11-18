app.module("Modules.Grant", function (users, app) {

    var grantsView = null;
    var grantCollection, networkCollection;

    function getNetworks() {
        var deferred =
        app.getCollection('NetworksCollection');
        return deferred;
    }
    function getGrants() {
        var deferred = app.getCollection("GrantsCollection"); 
        return deferred;
    }
    function show_grants() {
        $.when(getNetworks(), getGrants()).done(function(networks, grants) {
            networkCollection = networks;
            grantCollection = grants;
            app.vent.trigger("stopLoading");
            grantsView = new app.Views.Grants({
                collection: grantCollection,
                networks: networkCollection
            });
            app.Regions.topWorkArea.show(grantsView);
        });
    }

    var controller = {
        grant: function() {
            app.Regions.bottomWorkArea.close();
            var view = {};
            app.vent.trigger("startLoading");
            if (app.User.isNew()) {
                app.User.on('change', function (e){
                    if (app.User.isNew() == false) {
                        show_grants();
                    }
                });
            } else {
                show_grants();
            }
        }
    };
    var routes = {
        grant: 'grant'
    };
    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });
    app.addInitializer(function (options) {
        var rtr = new router();
    });
    app.bind("initialize:after", function (options) {
        app.vent.trigger("addResource", "grant", "Grants");
    });

});