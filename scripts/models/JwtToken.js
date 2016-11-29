app.Models.JwtToken = Backbone.Model.extend({
    initialize: function (params) {
        localStorage.deviceHiveToken = params.accessToken;
        var appUrl = app.f.prepareAbsolutePath(app.config.rootUrl);
        localStorage.lastActivity = (new Date()).valueOf();
        location.href = appUrl;
    }
});
