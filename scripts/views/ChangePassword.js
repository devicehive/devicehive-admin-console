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
app.Views.ChangePassword = Backbone.Marionette.ItemView.extend({
    template: 'change-password',
    onRender: function() {
        var context = this;
        function error(message) {
            context.$el.find('form .error').html(message);
            context.$el.find('form .error').toggleClass('ui-helper-hidden', !message);
        }
        function onSuccess(newpassword) {
            context.$el.find('form .success').toggleClass('ui-helper-hidden', !newpassword);
            if (newpassword) {
                sessionStorage.userPassword = newpassword;
                localStorage.lastActivity = (new Date()).valueOf();
                context.$el.find('form .fields').hide();
                setTimeout(function() {
                    Backbone.history.navigate('', { trigger: true })
                }, 1700);
            }
        }

        this.$el.find('form').on('submit', function(e) {
            e.preventDefault();
            var accessToken = localStorage.deviceHiveToken;
            var $form = $(e.target);
            error(''); // clear error message
            var currentpassword = $form.find('[name=currentpassword]').val();
            var newpassword = $form.find('[name=password]').val();
            var confirmpassword = $form.find('[name=confirmpassword]').val();
            if ( !newpassword ) {
                error('Please specify new password');
                return;
            }
            if ( newpassword != confirmpassword ) {
                error('New password and confirm password do not match');
                return;
            }
            // perform check of current password
            var headers = {'Authorization': 'Bearer '+ accessToken};
            var options = {
                headers: headers,
                success: function(resp, status) {
                    // try to set new password
                    $.ajax(app.User.urlCurrent(), {
                        headers: headers,
                        type: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify({ password: newpassword, oldPassword: currentpassword}),
                        success: function(resp) {
                            onSuccess(newpassword);
                        },
                        error: function(resp) {
                            var responseObject = JSON.parse(resp.responseText);
                            if (resp.status == 403) {
                                $form.find('[name=currentpassword], [name=password], [name=confirmpassword]').val('');
                            }
                            if (responseObject.message) {
                                error(responseObject.message);
                            } else {
                                error('Server error '+resp.status+': '+resp.responseText);
                            }
                        }
                    });
                },
                error: function(resp) {
                    if (resp.status == 401) {
                        $form.find('[name=currentpassword]').val('');
                        error('Current password incorrect');
                    } else {
                        error('Server error');
                    }
                }
            };
            $.ajax(app.User.urlCurrent(), options);
        });
    }
});
