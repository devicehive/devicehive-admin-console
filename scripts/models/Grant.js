app.Models.Grant = Backbone.AuthModel.extend({
    urlRoot: function () {
         return app.config.restEndpoint + "/user/current/oauth/grant";
     }
});

app.Models.GrantsCollection = Backbone.AuthCollection.extend({
    url: function () {
         return app.config.restEndpoint + "/user/current/oauth/grant";
    },
    model: app.Models.Grant,
});
