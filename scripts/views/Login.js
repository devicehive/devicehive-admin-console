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
            var login = $(e.target).find('[name=login]').val();
            var password = $(e.target).find('[name=password]').val();
            var options = {
                headers: {'Authorization': 'Basic '+btoa(login+':'+password)},
                success: function(resp, status) {
                    sessionStorage.userLogin=login;
                    sessionStorage.userPassword=password;
                    sessionStorage.lastActivity=(new Date()).valueOf();
                    location.reload(true);
                },
                error: function(resp, status) {
                    if (resp.status == 401) {
                        showError('Wrong login or password');
                    } else {
                        showError('Server error: '+resp.responseText);
                    }
                }
            };

            $.ajax(app.Models.User.prototype.urlCurrent(), options);
        });
    }
});
