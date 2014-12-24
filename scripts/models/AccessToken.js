app.Models.AccessToken = Backbone.Model.extend({
    url: function() {
        return app.restEndpoint + '/oauth2/accesskey';
    },
    initialize: function (params) {
        this.fetch({

            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.setRequestHeader('Authorization', 'Identity');
            },

            data: params,

            type: 'POST',

            success: function (response) {
                var appUrl =  app.f.prepareAbsolutePath(app.rootUrl);
                sessionStorage.deviceHiveToken=response.get('key');
                sessionStorage.lastActivity=(new Date()).valueOf();
                location.href = appUrl;
            },
            error: function() {
                app.authenticationError = "Identity authentication failed";
                app.trigger('needAuth');
            }
        });
    }
});
