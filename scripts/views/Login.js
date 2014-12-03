app.Views.Login = Backbone.Marionette.ItemView.extend({
    template: 'user-login',
    onRender: function() {
        var context = this;
        var googleConfig = app.oauthConfig.get('google');
        var facebookConfig = app.oauthConfig.get('facebook');
        var githubConfig = app.oauthConfig.get('github');

        if (app.authenticationError) {
            showError(app.authenticationError);
        }

        var identityProviderState = "identity_provider_id=";
        if (googleConfig.isAvailable) {
            this.$el.find('#googleClientId')[0].value = googleConfig.clientId;
            this.$el.find('#googleStateId')[0].value = identityProviderState + googleConfig.providerId;
        } else {
            this.$el.find('.google-identity-login').css("display", "none");
        }

        if (facebookConfig.isAvailable) {
            this.$el.find('#facebookClientId')[0].value = facebookConfig.clientId;
            this.$el.find('#facebookStateId')[0].value = identityProviderState + facebookConfig.providerId;
        } else {
            this.$el.find('.facebook-identity-login').css("display", "none");
        }

        if (githubConfig.isAvailable) {
            this.$el.find('#githubClientId')[0].value = githubConfig.clientId;
            this.$el.find('#githubStateId')[0].value = identityProviderState + githubConfig.providerId;
        } else {
            this.$el.find('.github-identity-login').css("display", "none");
        }

        [].forEach.call(this.$el.find('[name=redirect_uri]'), function(elem) {
            elem.value = app.config.redirectUri + app.config.rootUrl;
        });

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
