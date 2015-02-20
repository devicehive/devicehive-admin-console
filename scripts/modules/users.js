app.module("Modules.Users", function (users, app) {

    var usersCollection;
    var networksCollection;
    var currentUser;

    var usersView;
    var editView;
    var userNetworksView;
    var appendUserNetworkView;

    //show users list, initializing the users collection.
    //fire callback when users collection initialized

    var showUsers = function () {
        var retIt = $.Deferred();

        var twacv = app.Regions.topWorkArea.currentView;
        //prevents from re-creating view if it's already shown
        if (!(_.isUndefined(twacv)) && twacv == usersView) {
            retIt.resolve();
        }
        else {
            app.getCollection("UsersCollection").done(function (res) {
                usersCollection = res;
                if (usersCollection != null) {
                    usersView = new app.Views.Users({ collection: usersCollection });
                    usersView.on("addClicked", function () {
                        var path = "user/create";
                        Backbone.history.navigate(path, { trigger: true });
                    });
                    usersView.on("itemview:networksClicked", function (viewObject) {
                        var path = "user/" + viewObject.model.get("id") + "/networks";
                        Backbone.history.navigate(path, { trigger: true });
                    });
                    usersView.on("itemview:accessKeysClicked", function (viewObject) {
                        var path = "user/" + viewObject.model.get("id") + "/accesskeys";
                        app.currentUserRole = viewObject.model.get("role");
                        Backbone.history.navigate(path, { trigger: true });
                    });
                    usersView.on("itemview:editClicked", function (viewObject) {
                        var path = "user/" + viewObject.model.get("id");
                        Backbone.history.navigate(path, { trigger: true });
                    });
                    usersView.on("itemview:deleteClicked", function (viewObject) {
                        if (confirm("Do you really want to delete this user?")) {
                            viewObject.model.destroy({wait: true, error: function(model, response) {
                                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
                            }});
                        }
                    });
                    app.Regions.topWorkArea.show(usersView);
                }
                retIt.resolve();
            });
        }
        return retIt;
    };

    //show edit view and pick select the user
    //users collection should has been already initialized.
    var showEdit = function (id) {
        var retIt = $.Deferred();

        //prevents from re-creating view if it's already shown and current user hasn't been changed
        var twacv = app.Regions.bottomWorkArea.currentView;
        if (!(_.isUndefined(twacv)) && twacv == editView && currentUser != null && id == currentUser.get("id")) {
            retIt.resolve();
        }
        else {
            if (id == "create")
                currentUser = new app.Models.User();
            else
                currentUser = usersCollection.find(function (user) {
                    return user.get("id") == id;
                });

            editView = new app.Views.UserCreateEdit({ model: currentUser });
            editView.on("onAfterUserSave", function (user) {
                if (!usersCollection.find(function (usr) { return usr.id == user.id; }))
		        {
                    usersCollection.add(user);
                }
                usersCollection.sort();
                if (app.Regions.bottomWorkArea.currentView == editView)
                    app.Regions.bottomWorkArea.close();

                var path = "user";
                Backbone.history.navigate(path, { trigger: false });
            });
            editView.on("onCloseClick", function (user) {
                if (app.Regions.bottomWorkArea.currentView == editView)
                    app.Regions.bottomWorkArea.close();

                var path = "user";
                Backbone.history.navigate(path, { trigger: false });
            });

            app.Regions.bottomWorkArea.show(editView);
            retIt.resolve();
        }
        return retIt;
    };


    var showNetworksForUser = function (id) {
        var retIt = $.Deferred();

        var twacv = app.Regions.topWorkArea.currentView;
        var tbacw = app.Regions.bottomWorkArea.currentView;
        //prevents from re-creating views if they are already have shown and current user hasn't been changed
        if (!(_.isUndefined(twacv)) && twacv == userNetworksView && !(_.isUndefined(tbacw)) && tbacw == appendUserNetworkView && currentUser != null && id == currentUser.get("id")) {
            retIt.resolve();
        }
        else {
            currentUser = new app.Models.User({ id: id });
            currentUser.fetch({
                success: function () {
                    userNetworksView = new app.Views.UserNetworks({ model: currentUser });
                    app.Regions.topWorkArea.show(userNetworksView);
                    userNetworksView.on("backClicked", function () {
                        Backbone.history.navigate("user", { trigger: true });
                    });

                    app.getCollection("NetworksCollection").done(function (res) {
                        networksCollection = res;
                        if (networksCollection != null) {
                            appendUserNetworkView = new app.Views.AppendUserToNetwork({ model: currentUser, collection: networksCollection });
                            app.Regions.bottomWorkArea.show(appendUserNetworkView);
                        }
                        retIt.resolve();
                    });
                }
            });
        }
        return retIt;
    };

    var controller = {
        users_show: function () {
            app.vent.trigger("startLoading");

            showUsers().done(function () {
                app.vent.trigger("stopLoading");
                app.Regions.bottomWorkArea.close();
            });
        },
        users_Edit: function (id) {
            app.vent.trigger("startLoading");

            showUsers().pipe(function () {
                showEdit(id);
            }).done(function () {
                app.vent.trigger("stopLoading");
            });
        },
        users_Networks: function (id) {
            app.vent.trigger("startLoading");

            showNetworksForUser(id).done(function () {
                app.vent.trigger("stopLoading");
            });
        }
    };

    var routes = {
        "user": "users_show",
        "user/:id": "users_Edit",
        "user/:id/networks": "users_Networks"
    };

    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });

    app.addInitializer(function (options) {
        var rtr = new router();
    });

    app.bind("login", function (options) {
        app.vent.trigger("addResource", "user", "Users", [ app.Enums.UserRole.Administrator ]);
    });

});