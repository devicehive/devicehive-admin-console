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
app.module("Modules.Networks", function (users, app) {

    var networksCollection;

    var networksView;

    var showNetworks = function () {
        var retIt = $.Deferred();

        var twacv = app.Regions.topWorkArea.currentView;
        if (!(_.isUndefined(twacv)) && twacv == networksView) {
            retIt.resolve();
        }
        else {
            app.getCollection("NetworksCollection").done(function (res) {
                networksCollection = res;

                if (networksCollection != null) {
                    networksView = new app.Views.Networks({ collection: networksCollection });
                    app.Regions.topWorkArea.show(networksView);
                    if (app.User.isNew()) {
                        app.User.on('change', function (e){
                            if (app.User.isNew() == false) {
                                networksView.render();
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
        networks_show: function () {
            if ( !app.hasCredentials() ) {
                return;
            }
            app.vent.trigger("startLoading");

            showNetworks().done(function () {
                app.vent.trigger("stopLoading");
                app.Regions.bottomWorkArea.close();
            });
        }
    };

    var routes = {
        "networks": "networks_show"
    };

    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });

    app.addInitializer(function (options) {
        var rtr = new router();
    });

    app.bind("initialize:after", function (options) {
        app.vent.trigger("addResource", "networks", "Networks");
    });

});
