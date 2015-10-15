app.Models.AccessToken = Backbone.Model.extend({
    url: function() {
        return app.config.restEndpoint + '/auth/accesskey';
    },
    initialize: function (params) {
        localStorage.loginMethod = params.providerName;
        this.fetch({

            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            },

            data: JSON.stringify(params),

            type: 'POST',
            async: false,

            success: function (response) {
                var appUrl =  app.f.prepareAbsolutePath(app.config.rootUrl);
                localStorage.deviceHiveToken=response.get('key');
                localStorage.lastActivity=(new Date()).valueOf();
                delete sessionStorage.authenticationError;
                location.href = appUrl;
            },
            error: function(req, resp) {
                var message;
                try {
                    message = JSON.parse(resp.responseText).message;
                }
                catch(e) {
                    message = 'Unable to connect to the DeviceHive server!';
                }
                sessionStorage.authenticationError = message;
                app.trigger('needAuth');
            }
        });
    }
});
