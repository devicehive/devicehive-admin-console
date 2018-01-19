/*
  DeviceHive Admin Console business logic

  Copyright (C) 2016 DataArt

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */
app.module("Modules.DeviceTypes", function (users, app) {

    var deviceTypesCollection;

    var deviceTypesView;

    var showDeviceTypes = function () {
        var retIt = $.Deferred();

        var twacv = app.Regions.topWorkArea.currentView;
        if (!(_.isUndefined(twacv)) && twacv == deviceTypesView) {
            retIt.resolve();
        }
        else {
            app.getCollection("DeviceTypesCollection").done(function (res) {
                deviceTypesCollection = res;

                if (deviceTypesCollection != null) {
                    deviceTypesView = new app.Views.DeviceTypes({ collection: deviceTypesCollection });
                    app.Regions.topWorkArea.show(deviceTypesView);
                    if (app.User.isNew()) {
                        app.User.on('change', function (e){
                            if (app.User.isNew() == false) {
                                deviceTypesView.render();
                            }
                        });
                    }
                }

                retIt.resolve();
            });
        }

        return retIt;
    };

    var controller = {
        device_types_show: function () {
            if ( !app.hasCredentials() ) {
                return;
            }
            app.vent.trigger("startLoading");

            showDeviceTypes().done(function () {
                app.vent.trigger("stopLoading");
                app.Regions.bottomWorkArea.close();
            });
        }
    };

    var routes = {
        "devicetypes": "device_types_show"
    };

    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });

    app.addInitializer(function (options) {
        var rtr = new router();
    });

    app.bind("initialize:after", function (options) {
        app.vent.trigger("addResource", "devicetypes", "Device Types");
    });

});
