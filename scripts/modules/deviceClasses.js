app.module("Modules.DeviceClasses", function (users, app) {

    var deviceClassesCollection;
    var currentDC;

    var deviceClassesView;
    var equipsClassView;

    //show device classes
    //fire callback after device classes collection load and fetched
    var showDeviceClasses = function () {
        var retIt = $.Deferred();

        var twacv = app.Regions.topWorkArea.currentView;
        if (!(_.isUndefined(twacv)) && twacv == deviceClassesView) {
            retIt.resolve();
        }
        else {
            app.getCollection("DeviceClassesCollection").done(function(res) {
                if (res != null) {
                    deviceClassesCollection = res;

                    deviceClassesView = new app.Views.DeviceClasses({ collection: deviceClassesCollection });

                    deviceClassesView.on("itemview:showEquipments", function(viewObject) {
                        var path = "device-class/" + viewObject.model.get("id");
                        Backbone.history.navigate(path, { trigger: true });
                    });
                    app.Regions.topWorkArea.show(deviceClassesView);
                }
                retIt.resolve();
            });
        }
        
        return retIt;
    };

    //var showEquipments = function (id, isCopy) {
    //    var retIt = $.Deferred();
    //
    //    var bwacv = app.Regions.bottomWorkArea.currentView;
    //    if (!(_.isUndefined(bwacv)) && bwacv == equipsClassView && !_.isUndefined(currentDC) && currentDC.get("id") == id && isCopy != true) {
    //        retIt.resolve();
    //        return retIt;
    //    }
    //
    //    currentDC = deviceClassesCollection.find(function (dc) { return dc.get("id") == id; });
    //
    //    if (_.isEmpty(currentDC)) {
    //        retIt.resolve();
    //        return retIt;
    //    }
    //
    //    currentDC.getEquipments(function (equips) {
    //        equipsClassView = new app.Views.DeviceClassEquipments({ model: currentDC, collection: equips });
    //
    //        currentDC.bind("destroy", function () {
    //            equipsClassView.close();
    //            delete equipsClassView;
    //
    //            var path = "device-class";
    //            Backbone.history.navigate(path, { trigger: true });
    //
    //        }, this);
    //
    //        equipsClassView.on("closeEquipments", function () {
    //            equipsClassView.close();
    //            delete equipsClassView;
    //
    //            var path = "device-class";
    //            Backbone.history.navigate(path, { trigger: true });
    //        });
    //
    //        app.Regions.bottomWorkArea.show(equipsClassView);
    //
    //        retIt.resolve();
    //    });
    //
    //    return retIt;
    //};

    var controller = {
        devclass_show: function () {
            app.vent.trigger("startLoading");

            showDeviceClasses().done(function () {
                app.vent.trigger("stopLoading");
                app.Regions.bottomWorkArea.close();
            });
        }
        //devclass_Equipments: function (id) {
        //    app.vent.trigger("startLoading");
        //
        //    showDeviceClasses().pipe(function () {
        //        return showEquipments(id);
        //    }).done(function () {
        //        app.vent.trigger("stopLoading");
        //    });
        //}
    };

    var routes = {
        "device-class": "devclass_show"
        //"device-class/:id": "devclass_Equipments"
    };

    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });

    app.addInitializer(function (options) {
        var rtr = new router();
    });

    app.bind("login", function (options) {
        app.vent.trigger("addResource", "device-class", "Device Classes",
            [ app.Enums.UserRole.Administrator ]);
    });

});
