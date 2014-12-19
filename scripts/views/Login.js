app.Views.Login = Backbone.Marionette.ItemView.extend({
    template: 'user-login',
    onRender: function() {
        var context = this;

        if (app.authenticationError) {
            showError(app.authenticationError);
        }
        initializeOAuth2Forms();

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

        function initializeOAuth2Forms() {
            var identityProviderState = "identity_provider_id=";

            if (app.googleConfig && app.googleConfig.isAvailable) {
                context.$el.find('#googleClientId')[0].value = app.googleConfig.clientId;
                context.$el.find('#googleStateId')[0].value = identityProviderState + app.googleConfig.providerId;
                context.$el.find(".google-identity-login").removeClass('ui-helper-hidden');
            }

            if (app.facebookConfig && app.facebookConfig.isAvailable) {
                context.$el.find('#facebookClientId')[0].value = app.facebookConfig.clientId;
                context.$el.find('#facebookStateId')[0].value = identityProviderState + app.facebookConfig.providerId;
                context.$el.find(".facebook-identity-login").removeClass('ui-helper-hidden');
            }

            if (app.githubConfig && app.githubConfig.isAvailable) {
                context.$el.find('#githubClientId')[0].value = app.githubConfig.clientId;
                context.$el.find('#githubStateId')[0].value = identityProviderState + app.githubConfig.providerId;
                context.$el.find(".github-identity-login").removeClass('ui-helper-hidden');
            }

            [].forEach.call(context.$el.find('[name=redirect_uri]'), function(elem) {
                elem.value = app.config.redirectUri + app.config.rootUrl;
            });
        }
    }
});
