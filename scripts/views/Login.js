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
app.Views.Login = Backbone.Marionette.ItemView.extend({
    template: 'user-login',
    events: {
        "submit form": "loginFormSubmit",
    },

    loginFormSubmit: function(e) {

        e.preventDefault();
        this.showError(''); // clear error message
        var params = {};
        params.login = $(e.target).find('[name=login]').val();
        params.password= $(e.target).find('[name=password]').val();

        if((params.login.length > 0) && (params.password.length > 0)) {
            new app.Models.JwtToken(params);
        } else {
            sessionStorage.authenticationError = "Please provide Login and Password";
        }
        this.showError(sessionStorage.authenticationError);
    },

    showError: function(message) {
        var context = this;

        context.$el.find('form .error').html(message);
        if (message) {
            context.$el.find('form input[type=accessToken]').val('').focus();
        }
        context.$el.find('form .error').toggleClass('ui-helper-hidden', !message);
    },

    onRender: function() {
        sessionStorage.authenticationError = "";
    }
});
