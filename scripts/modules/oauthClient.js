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
app.module("Modules.OAuth2Client", function (users, app) {
    function getOAuth2Clients() {
        var deferred = app.getCollection("OAuthClientsCollection"); 
        return deferred;
    }
    var controller = {
        oauthclient: function() {
            app.Regions.bottomWorkArea.close();
            app.vent.trigger("startLoading");
            $.when(getOAuth2Clients()).done(function(clients) {
                var view = new app.Views.OAuth2Clients({collection: clients});
                app.Regions.topWorkArea.show(view);
                app.vent.trigger("stopLoading");
            });
        }
    };
    var routes = {
        oauthclient: 'oauthclient'
    };
    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });
    app.addInitializer(function (options) {
        var rtr = new router();
    });
    app.bind("login", function (options) {
        app.vent.trigger("addResource", "oauthclient", "OAuth Clients", [ app.Enums.UserRole.Administrator ]);
    });
});