app.Models.OAuth2AccessToken = Backbone.Model.extend({
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
                localStorage.deviceHiveToken=response.get('key');
                localStorage.lastActivity=(new Date()).valueOf();
                delete sessionStorage.authenticationError;
                app.trigger('login');
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
            }
        });
    }
});
