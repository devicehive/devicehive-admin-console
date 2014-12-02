app.Views.Login = Backbone.Marionette.ItemView.extend({
    template: 'user-login',
    onRender: function() {
        var context = this;
        var deviceHiveLoginUrl = "http://" + window.location.host + app.config.rootUrl;

        [].forEach.call(this.$el.find('[name=redirect_uri]'), function(elem) {
            elem.value = deviceHiveLoginUrl;
        });

        this.$el.find('#googleClientId')[0].value = app.config.googleClientId;
        this.$el.find('#facebookClientId')[0].value = app.config.facebookClientId;
        this.$el.find('#githubClientId')[0].value = app.config.githubClientId;

        var identityProviderState = "identity_provider_id=";
        this.$el.find('#googleStateId')[0].value = identityProviderState + app.config.googleIdentityProviderId;
        this.$el.find('#facebookStateId')[0].value = identityProviderState + app.config.facebookIdentityProviderId;
        this.$el.find('#githubStateId')[0].value = identityProviderState + app.config.githubIdentityProviderId;

        this.$el.find('.credentials-form').on('submit', function(e) {
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

        function showError(message) {
            context.$el.find('form .error').html(message);
            if (message) {
                context.$el.find('form input[type=password]').val('').focus();
            }
            context.$el.find('form .error').toggleClass('ui-helper-hidden', !message);
        }
    }
});
