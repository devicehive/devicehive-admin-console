app.module("Modules.Networks", function (users, app) {
    var accessKeysCollection;
    var networksCollection;
    var devicesCollection;
    var currentAccessKey;
    var currentUser;

    var accessKeysView;
    var accessKeyEditView;

    var showAccessKeys = function (userId) {
        var retIt = $.Deferred();

        var twacv = app.Regions.topWorkArea.currentView;
        if (!(_.isUndefined(twacv)) && twacv == accessKeysView && ((currentUser == null && userId == null) || (currentUser != null && currentUser.id == userId))) {
            retIt.resolve();
        }
        else {
            var hasUser = $.Deferred();
            var accessKeysCollectionOptions = null;
            if (userId != null) {
                currentUser = new app.Models.User({ id: userId });
                currentUser.fetch({
                    success: function () {
                        accessKeysCollectionOptions = { userId: currentUser.id };
                        hasUser.resolve();
                    }
                });
            }
            else {
                currentUser = null;
                hasUser.resolve();
            }

            hasUser.done(function() {
                app.getCollection("AccessKeysCollection", accessKeysCollectionOptions).done(function (accessKeys) {
                    accessKeysCollection = accessKeys;

                    if (accessKeysCollection != null) {
                        app.getCollection("NetworksCollection").done(function(networks) {
                            networksCollection = networks;

                            app.getCollection("DevicesCollection").done(function(devices) {
                                devicesCollection = devices;

                                accessKeysView = new app.Views.AccessKeys({
                                    collection: accessKeysCollection,
                                    networks: networks,
                                    devices: devices,
                                    user: currentUser
                                });
                                var pathPrefix = userId == null && "accesskeys" || ("user/" + userId + "/accesskeys");
                                accessKeysView.on("itemview:edit", function (viewObject) {
                                    var path = pathPrefix + "/" + viewObject.model.id;
                                    Backbone.history.navigate(path, { trigger: true });
                                });
                                accessKeysView.on("addClicked", function () {
                                    var path = pathPrefix + "/create";
                                    Backbone.history.navigate(path, { trigger: true });
                                });
                                accessKeysView.on("backClicked", function () {
                                    Backbone.history.navigate("user", { trigger: true });
                                });
                                accessKeysView.on("itemview:deleted", function (source, id) {
                                    // close open view on delete
                                    var bwacv = app.Regions.bottomWorkArea.currentView;
                                    if (!(_.isUndefined(bwacv)) && bwacv == accessKeyEditView && currentAccessKey != null && id == currentAccessKey.id) {
                                        Backbone.history.navigate(pathPrefix, { trigger: true });
                                    }
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
            });
        }

        return retIt;
    };

    var editAccessKey = function(userId, id) {
        var retIt = $.Deferred();

        var bwacv = app.Regions.bottomWorkArea.currentView;
        if (!(_.isUndefined(bwacv)) && bwacv == accessKeyEditView && currentAccessKey != null && id == currentAccessKey.id &&
            ((currentUser == null && userId == null) || (currentUser != null && currentUser.id == userId))) {
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

            accessKeyEditView = new app.Views.AccessKey({
                model: currentAccessKey,
                networks: networksCollection,
                devices: devicesCollection,
                user: currentUser
            });

            var path = userId == null && "accesskeys" || ("user/" + userId + "/accesskeys");
            accessKeyEditView.on("cancel", function() {
                if (app.Regions.bottomWorkArea.currentView == accessKeyEditView)
                    app.Regions.bottomWorkArea.close();
                Backbone.history.navigate(path, { trigger: false });
            });

            accessKeyEditView.on("success", function(accessKey) {
                if (!accessKeysCollection.find(function (ak) { return ak.id == accessKey.id; }))
                {
                    accessKeysCollection.add(accessKey);
                }
                accessKeysCollection.sort();
                if (app.Regions.bottomWorkArea.currentView == accessKeyEditView)
                    app.Regions.bottomWorkArea.close();
                Backbone.history.navigate(path, { trigger: false });
            });

            app.Regions.bottomWorkArea.show(accessKeyEditView);
            retIt.resolve();
        }

        return retIt;
    };

    var controller = {
        accessKeys_show: function (userId) {
            app.vent.trigger("startLoading");

            showAccessKeys(userId).done(function () {
                app.vent.trigger("stopLoading");
                app.Regions.bottomWorkArea.close();
            });
        },

        accessKeys_edit: function (userId, id) {
            app.vent.trigger("startLoading");

            // may be invoked as (userId, id) or (id)
            if (id == null) {
                id = userId;
                userId = null;
            }

            showAccessKeys(userId).pipe(function() {
                editAccessKey(userId, id);
            }).done(function() {
                app.vent.trigger("stopLoading");
            });
        }
    };

    var routes = {
        "accesskeys": "accessKeys_show",
        "accesskeys/:id": "accessKeys_edit",
        "user/:userId/accesskeys": "accessKeys_show",
        "user/:userId/accesskeys/:id": "accessKeys_edit"
    };

    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });

    app.addInitializer(function (options) {
        var rtr = new router();
    });

    app.bind("initialize:after", function (options) {
        app.vent.trigger("addResource", "accesskeys", "Access Keys");
    });

});