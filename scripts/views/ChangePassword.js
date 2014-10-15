app.Views.ChangePassword = Backbone.Marionette.ItemView.extend({
    template: 'change-password',
    onRender: function() {
        console.log('render change password');
        var context = this;
        function error(message) {
            context.$el.find('form .error').html(message);
            context.$el.find('form .error').toggleClass('ui-helper-hidden', !message);
        };
        function success(newpassword) {
            context.$el.find('form .success').toggleClass('ui-helper-hidden', !newpassword);
            if (newpassword) {
                sessionStorage.userPassword = newpassword;
                sessionStorage.lastActivity = (new Date()).valueOf();
                context.$el.find('form .fields').hide();
            }
        }

        this.$el.find('form').on('submit', function(e) {
            e.preventDefault();
            console.log('form submit event %o', e);
            var login = sessionStorage.userLogin;
            var $form = $(e.target);
            error(''); // clear error message
            var currentpassword = $form.find('[name=currentpassword]').val();
            var newpassword = $form.find('[name=password]').val();
            var confirmpassword = $form.find('[name=confirmpassword]').val();
            if ( !currentpassword ) {
                error('Please specify current password');
                return;
            }
            if ( !newpassword ) {
                error('Please specify new password');
                return;
            }
            if ( newpassword != confirmpassword ) {
                console.log('newpassword %o, confpassword %o', newpassword, confirmpassword);
                error('New password and confirm password do not match');
                return;
            }
            // perform check of current password
            var headers = {'Authorization': 'Basic '+btoa(login+':'+currentpassword)}; 
            var options = {
                headers: headers,
                success: function(resp, status) {
                    console.log('success %o', resp);
                    // try to set new password
                    $.ajax(app.User.urlCurrent(), {
                        headers: headers,
                        type: 'PUT',
                        data: { password: newpassword },
                        success: function(resp) {
                            console.log('successfully changed password');
                            success(newpassword);
                        },
                        error: function(resp) {
                            console.log('error changing password %o %o', resp, arguments);
                            var responseObject = JSON.parse(resp.responseText);
                            if (responseObject.message) {
                                error(responseObject.message);
                            } else {
                                error('Server error '+resp.status+': '+resp.responseText);
                            }
                        }
                    });
                },
                error: function(resp) {
                    console.log('fail %o', resp);
                    if (resp.status == 401) {
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