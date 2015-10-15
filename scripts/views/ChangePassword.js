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
            var accessKey = localStorage.deviceHiveToken;
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
            var headers = {'Authorization': 'Bearer '+ accessKey};
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
