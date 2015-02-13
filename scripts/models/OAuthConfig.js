app.Models.OAuthConfig = Backbone.Model.extend({
    url: function() {
        return app.config.restEndpoint + '/info/config/auth';
    },
    initialize: function () {
        this.fetch({
            success: function(resp) {
                app.config.oauthConfig = resp;
            },
            async: false
        });
    }
});