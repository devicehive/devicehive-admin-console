app.module("Modules.Networks", function (users, app) {
    var accessKeysCollection;
    var networksCollection;
    var devicesCollection;

    var accessKeysView;

    var showAccessKeys = function () {
        var retIt = $.Deferred();

        var twacv = app.Regions.topWorkArea.currentView;
        if (!(_.isUndefined(twacv)) && twacv == accessKeysView) {
            retIt.resolve();
        }
        else {
            app.getCollection("AccessKeysCollection").done(function (accessKeys) {
                accessKeysCollection = accessKeys;

                if (accessKeysCollection != null) {
                    app.getCollection("NetworksCollection").done(function(networks) {
                        networksCollection = networks;

                        app.getCollection("DevicesCollection").done(function(devices) {
                            devicesCollection = devices;

                            accessKeysView = new app.Views.AccessKeys({
                                collection: accessKeysCollection,
                                networks: networks,
                                devices: devices
                            });
                            app.Regions.topWorkArea.show(accessKeysView);

                            retIt.resolve();
                        });
                    })
                }
                else {
                    retIt.resolve();
                }
            });
        }

        return retIt;
    };

    var controller = {
        accessKeys_show: function () {
            app.vent.trigger("startLoading");

            showAccessKeys().done(function () {
                app.vent.trigger("stopLoading");
                app.Regions.bottomWorkArea.close();
            });
        }
    };

    var routes = {
        "accesskeys": "accessKeys_show"
    };

    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });

    app.addInitializer(function (options) {
        var rtr = new router();
    });

    app.bind("initialize:after", function (options) {
        app.vent.trigger("addResource", "accesskeys", "Access Keys");
    });

});