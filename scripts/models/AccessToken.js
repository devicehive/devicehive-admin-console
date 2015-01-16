app.Models.AccessToken = Backbone.Model.extend({
    url: function() {
        return app.restEndpoint + '/auth/accesskey';
    },
    initialize: function (params) {
        this.fetch({

            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            },

            data: JSON.stringify(params),

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
