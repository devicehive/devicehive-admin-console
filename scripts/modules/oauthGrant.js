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
app.module("Modules.OAuth2Grant", function (users, app) {
    var controller = {
        grant: function() {
            var networksCollection = new app.Models.NetworksCollection();
            var scopeCollection = app.OAuth2.getScopeCollection();
            networksCollection.fetch();
            var view = new app.Views.OAuth2IssueGrant({
                oauth: app.OAuth2,
                networksCollection: networksCollection,
                scopeCollection: scopeCollection
            });
            app.OAuth2.on('change', function() {
                view.render();
            });
            app.Regions.topWorkArea.show(view);
        }
    };
    var routes = {
        grant: 'grant'
    };
    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });
    app.addInitializer(function (options) {
        var rtr = new router();
    });
});