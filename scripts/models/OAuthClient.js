app.Models.OAuthClient = Backbone.AuthModel.extend({
    urlRoot: function () {
         return app.restEndpoint + "/oauth/client";
     },
     defaults: {
         domain: '',
         subnet: null,
         redirectUri: '',
         oauthId: '',
         oauthSecret: ''
     }
});

app.Models.OAuthClientsCollection = Backbone.AuthCollection.extend({
    url: function () {
         return app.restEndpoint + "/oauth/client";
    },
    model: app.Models.OAuthClient,
});
