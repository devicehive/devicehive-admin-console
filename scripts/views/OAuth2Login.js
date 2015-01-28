// Flavor of app.Views.Login especially for 
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
            var params = {};
            params.login = $(e.target).find('[name=login]').val();
            params.password = $(e.target).find('[name=password]').val();
            params.providerName = 'password';
            new app.Models.OAuth2AccessToken(params);
            if (sessionStorage.authenticationError) {
                showError(sessionStorage.authenticationError);
            }
        });
    }
});
