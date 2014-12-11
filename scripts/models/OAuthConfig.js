app.Models.OAuthConfig = Backbone.Model.extend({
    url: function() {
        return app.restEndpoint + '/info/config/oauth2';
    },
    initialize: function () {
        this.fetch({
            success: function(resp) {
                app.oauthConfig = resp;
            },
            async: false
        });
    }
});