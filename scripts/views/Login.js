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
            var googleConfig = app.oauthConfig.get('google');
            var facebookConfig = app.oauthConfig.get('facebook');
            var githubConfig = app.oauthConfig.get('github');

            var identityProviderState = "identity_provider_id=";

            if (googleConfig) {
                context.$el.find('#googleClientId')[0].value = googleConfig.clientId;
                context.$el.find('#googleStateId')[0].value = identityProviderState + googleConfig.providerId;
                context.$el.find(".google-identity-login").toggleClass('ui-helper-hidden', !googleConfig.isAvailable);
            }

            if (facebookConfig) {
                context.$el.find('#facebookClientId')[0].value = facebookConfig.clientId;
                context.$el.find('#facebookStateId')[0].value = identityProviderState + facebookConfig.providerId;
                context.$el.find(".facebook-identity-login").toggleClass('ui-helper-hidden', !facebookConfig.isAvailable);
            }

            if (githubConfig) {
                context.$el.find('#githubClientId')[0].value = githubConfig.clientId;
                context.$el.find('#githubStateId')[0].value = identityProviderState + githubConfig.providerId;
                context.$el.find(".github-identity-login").toggleClass('ui-helper-hidden', !githubConfig.isAvailable);
            }

            [].forEach.call(context.$el.find('[name=redirect_uri]'), function(elem) {
                elem.value = app.config.redirectUri + app.config.rootUrl;
            });
        }
    }
});
