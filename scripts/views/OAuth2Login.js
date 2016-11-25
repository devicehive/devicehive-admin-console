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
// Flavor of app.Views.Login especially for 
app.Views.Login = Backbone.Marionette.ItemView.extend({
    template: 'user-login',
    onRender: function() {
        var context = this;
        function showError(message) {
            context.$el.find('form .error').html(message);
            if (message) {
                context.$el.find('form input[type=password]').val('').focus();
            }
            context.$el.find('form .error').toggleClass('ui-helper-hidden', !message);
        };
        this.$el.find('form').on('submit', function(e) {
            e.preventDefault();
            showError(''); // clear error message
            var params = {};
            params.login = $(e.target).find('[name=login]').val();
            params.password = $(e.target).find('[name=password]').val();
            params.providerName = 'password';
            new app.Models.OAuth2AccessToken(params);
            if (sessionStorage.authenticationError) {
                showError(sessionStorage.authenticationError);
            }
        });
    }
});
