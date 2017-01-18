app.module("Modules.Devices", function (users, app) {

    var devicesCollection;
    var networksCollection;
    var classesCollection;

    var devicesView;
    var detailDeviceView;
    var panelsView;
    var selectedDevice;

    var deviceClassEditable = function() {
        return app.hasRole(app.Enums.UserRole.Administrator);
    };

    var showDevices = function () {
        var retIt = $.Deferred();

        var twacv = app.Regions.topWorkArea.currentView;
        if (!(_.isUndefined(twacv)) && twacv == devicesView) {
            retIt.resolve();
        }
        else {
            initLists(function () {
                app.getCollection("DevicesCollection").done(function (res) {
                    devicesCollection = res;
                    if (devicesCollection != null) {
                        devicesView = new app.Views.Devices({
                            collection: devicesCollection,
                            networks: networksCollection,
                            classes: classesCollection,
                            classEditable: deviceClassEditable()
                        });

                        devicesView.on("itemview:showDetail", function(itemView) {
                            var path = "devices/" + itemView.model.get("id");
                            Backbone.history.navigate(path, { trigger: true });
                        });

                        app.Regions.topWorkArea.show(devicesView);
                    }
                    retIt.resolve();
                });
            });
        }

        return retIt;
    };

    //show detail view of the device, after collections load, show panels view for this device in the mode, define by parameter
    var detailShow = function (id, mode) {
        var retIt = $.Deferred();

        var twacv = app.Regions.topWorkArea.currentView;
        if (!(_.isUndefined(twacv)) && twacv == detailDeviceView && !_.isUndefined(selectedDevice) && selectedDevice.get("id") == id) {
            retIt.resolve();
        }
        else {
            initLists(function () {
                selectedDevice = new app.Models.Device({ id: id });
                selectedDevice.fetch({
                    success: function () {
                        detailDeviceView = new app.Views.Device({
                            model: selectedDevice,
                            networks: networksCollection,
                            classes: classesCollection,
                            classEditable: deviceClassEditable()
                        });

                        app.Regions.topWorkArea.show(detailDeviceView);
                        showPanels(mode);
                        retIt.resolve();
                    }
                });
            });
        }
        return retIt;
    };

    var showPanels = function (mode) {
        panelsView = new app.Views.DevicePanels({ model: selectedDevice, state: mode });

        //change showing panel. Just mark the url, this event just indicates that active panel changed
        panelsView.on("onChangeMode", function (state) {
            var path = "devices/" + selectedDevice.get("id") + "/" + state;
            Backbone.history.navigate(path, { trigger: false });
        });
        app.Regions.bottomWorkArea.show(panelsView);
    };

    var initLists = function (success) {
        app.getCollection("NetworksCollection").done(function (res) {
            networksCollection = res;
            if (deviceClassEditable()) {
                app.getCollection("DeviceClassesCollection").done(function (clres) {
                    classesCollection = clres;
                    if (_.isFunction(success))
                        success();
                });
            }
            else {
                classesCollection = [];
                if (_.isFunction(success))
                    success();
            }
        });
    };

    function devices_show() {
        showDevices().done(function () {
                app.vent.trigger("stopLoading");
                app.Regions.bottomWorkArea.close();
            });
    }
    function detail_show(id, mode) {
        detailShow(id, mode).done(function () {
            app.vent.trigger("stopLoading");
        });
    }
    var controller = {
        devices_show: function () {
            app.vent.trigger("startLoading");
            // wait until current user object will be fetched from the server
            if (app.User.isNew()) {
                app.User.on('change', function (e){
                    if (app.User.isNew() == false) {
                        devices_show();
                    }
                });
            } else {
                devices_show();
            }

        },
        detail_show: function (id, mode) {
            app.vent.trigger("startLoading");
            // wait until current user object will be fetched from the server
            if (app.User.isNew()) {
                app.User.on('change', function (e){
                    if (app.User.isNew() == false) {
                        detail_show(id, mode);
                    }
                });
            } else {
                detail_show(id, mode);
            }
        }
    };

    var routes = {
        "": "devices_show",
        "devices": "devices_show",
        "devices/:id": "detail_show",
        "devices/:id/:action": "detail_show"
    };

    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });

    app.addInitializer(function (options) {
        var rtr = new router();
    });

    app.bind("initialize:after", function (options) {
        app.vent.trigger("addResource", "devices", "Devices");
    });

});