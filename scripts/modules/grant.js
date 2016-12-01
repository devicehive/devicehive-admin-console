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