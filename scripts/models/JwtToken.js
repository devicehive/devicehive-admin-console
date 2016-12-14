app.Models.JwtToken = Backbone.Model.extend({
    initialize: function (params) {
        localStorage.deviceHiveToken = params.accessToken;
        try {
            var parsedJwt = parseJwt(params.accessToken);
            localStorage.expiration = parsedJwt.payload.expiration;
        } catch (err) {
            console.log(err);
        }
        var appUrl = app.f.prepareAbsolutePath(app.config.rootUrl);
        localStorage.lastActivity = (new Date()).valueOf();
        location.href = appUrl;
    }
});

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}
