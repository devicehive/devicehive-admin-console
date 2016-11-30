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
app.module("Modules.Login", function (users, app) {
    var loginView = new app.Views.Login();
    var controller = {
        'auth': function() {
            app.Regions.bottomWorkArea.close();
            app.vent.trigger("stopLoading");
            if (localStorage.deviceHiveToken) {
                Backbone.history.navigate('', {trigger: true});
                return;
            } else {
                app.Regions.topWorkArea.show(loginView);
            }
        },
        'logout': function() {
            sessionStorage.removeItem("authenticationError");
            sendLogoutRequest();
        }
    };
    var routes = {
        auth: 'auth',
        logout: 'logout'
    };
    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });
    app.addInitializer(function (options) {
        var rtr = new router();
    });

    var sendLogoutRequest = function () {

        //$.ajax({
        //    url: app.config.restEndpoint + '/auth/accesskey',
        //    type: 'DELETE',
        //    beforeSend: function (xhr) {
        //        xhr.setRequestHeader('Authorization', "Bearer " + localStorage.deviceHiveToken);
        //    }
        //}).always(function () {
            delete localStorage.deviceHiveToken;
            Backbone.history.navigate('', { trigger: false });
            location.reload(true);
        //});
    };

});
