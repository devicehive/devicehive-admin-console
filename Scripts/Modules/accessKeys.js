app.module("Modules.Networks", function (users, app) {
    var accessKeysCollection;
    var networksCollection;
    var devicesCollection;
    var currentAccessKey;

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
                            accessKeysView.on("itemview:edit", function (viewObject) {
                                var path = "accesskeys/" + viewObject.model.id;
                                Backbone.history.navigate(path, { trigger: true });
                            });
                            accessKeysView.on("addClicked", function () {
                                var path = "accesskeys/create";
                                Backbone.history.navigate(path, { trigger: true });
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

    var editAccessKey = function(id) {
        var retIt = $.Deferred();

        var bwacv = app.Regions.bottomWorkArea.currentView;
        if (!(_.isUndefined(bwacv)) && bwacv == accessKeysView && currentAccessKey != null && id == currentAccessKey.id) {
            retIt.resolve();
        }
        else {
            if (id == "create") {
                currentAccessKey = new app.Models.AccessKey({ }, { collection: accessKeysCollection });
            }
            else {
                currentAccessKey = accessKeysCollection.find(function(ak) {
                    return ak.id == id;
                });
            }

            var editView = new app.Views.AccessKey({
                model: currentAccessKey,
                networks: networksCollection,
                devices: devicesCollection
            });

            editView.on("cancel", function() {
                if (app.Regions.bottomWorkArea.currentView == editView)
                    app.Regions.bottomWorkArea.close();
                var path = "accesskeys";
                Backbone.history.navigate(path, { trigger: false });
            });

            editView.on("success", function(accessKey) {
                if (!accessKeysCollection.find(function (ak) { return ak.id == accessKey.id; }))
                {
                    accessKeysCollection.add(accessKey);
                }
                if (app.Regions.bottomWorkArea.currentView == editView)
                    app.Regions.bottomWorkArea.close();
                var path = "accesskeys";
                Backbone.history.navigate(path, { trigger: false });
            });

            app.Regions.bottomWorkArea.show(editView);
            retIt.resolve();
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
        },

        accessKeys_edit: function (id) {
            app.vent.trigger("startLoading");

            showAccessKeys().pipe(function() {
                editAccessKey(id);
            }).done(function() {
                app.vent.trigger("stopLoading");
            });
        }
    };

    var routes = {
        "accesskeys": "accessKeys_show",
        "accesskeys/:id": "accessKeys_edit"
    };

    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });

    app.addInitializer(function (options) {
        var rtr = new router();
    });

    app.bind("initialize:after", function (options) {
        app.vent.trigger("addResource", "accesskeys", "Access Keys");
    });

});