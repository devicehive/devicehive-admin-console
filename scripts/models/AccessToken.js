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
app.Models.AccessToken = Backbone.Model.extend({
    url: function() {
        return app.config.restEndpoint + '/auth/accesskey';
    },
    initialize: function (params) {
        localStorage.loginMethod = params.providerName;
        this.fetch({

            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            },

            data: JSON.stringify(params),

            type: 'POST',
            async: false,

            success: function (response) {
                var appUrl =  app.f.prepareAbsolutePath(app.config.rootUrl);
                localStorage.deviceHiveToken=response.get('key');
                localStorage.lastActivity=(new Date()).valueOf();
                delete sessionStorage.authenticationError;
                location.href = appUrl;
            },
            error: function(req, resp) {
                var message;
                try {
                    message = JSON.parse(resp.responseText).message;
                }
                catch(e) {
                    message = 'Unable to connect to the DeviceHive server!';
                }
                sessionStorage.authenticationError = message;
                app.trigger('needAuth');
            }
        });
    }
});
