app.Views.Login = Backbone.Marionette.ItemView.extend({
    template: 'user-login',
    onRender: function() {
        var context = this;

        if (sessionStorage.authenticationError) {
            showError(sessionStorage.authenticationError);
        }
        initializeOAuth2Forms();

        this.$el.find('.credentials-form').on('submit', function(e) {
            e.preventDefault();
            showError(''); // clear error message
            var params = {};
            params.login = $(e.target).find('[name=login]').val();
            params.password = $(e.target).find('[name=password]').val();
            params.providerName = 'password';

            new app.Models.AccessToken(params);
            showError(sessionStorage.authenticationError);
        });

        function showError(message) {
            context.$el.find('form .error').html(message);
            if (message) {
                context.$el.find('form input[type=password]').val('').focus();
            }
            context.$el.find('form .error').toggleClass('ui-helper-hidden', !message);
        }

        function initializeOAuth2Forms() {
            var identityProviderState = "provider=";
            var loginUrl = "&url=" + location.origin + location.pathname;

            if (app.config.googleConfig) {
                context.$el.find('#googleClientId')[0].value = app.config.googleConfig.clientId;
                context.$el.find('#googleStateId')[0].value = identityProviderState + "google" + loginUrl;
                context.$el.find(".google-identity-login").removeClass('ui-helper-hidden');
            }

            if (app.config.facebookConfig) {
                context.$el.find('#facebookClientId')[0].value = app.config.facebookConfig.clientId;
                context.$el.find('#facebookStateId')[0].value = identityProviderState + "facebook" + loginUrl;
                context.$el.find(".facebook-identity-login").removeClass('ui-helper-hidden');
            }

            if (app.config.githubConfig) {
                context.$el.find('#githubClientId')[0].value = app.config.githubConfig.clientId;
                context.$el.find('#githubStateId')[0].value = identityProviderState + "github" + loginUrl;
                context.$el.find(".github-identity-login").removeClass('ui-helper-hidden');
            }

            [].forEach.call(context.$el.find('[name=redirect_uri]'), function(elem) {
                elem.value = app.f.getRedirectUri();
            });
        }
    }
});
