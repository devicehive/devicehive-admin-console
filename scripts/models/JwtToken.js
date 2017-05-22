app.Models.JwtToken = Backbone.Model.extend({
    initialize: function (params) {
        var getTokenUrl = app.config.restEndpoint + '/token';

        $.ajax({
            type: "POST",
            url: getTokenUrl,
            async: false,
            dataType: "json",
            contentType: "application/json",
            crossDomain: true,
            cache: false,
            data: JSON.stringify(params),
            success: function (resp) {
                var accessToken = (resp.accessToken) ? resp.accessToken : null;
                //ToDO: testing token
                accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6MSwiYWN0aW9ucyI6WyIqIl0sIm5ldHdvcmtJZHMiOlsiKiJdLCJkZXZpY2VHdWlkcyI6WyIqIl0sImV4cGlyYXRpb24iOjE0OTcwMTg5NDgyODcsInRva2VuVHlwZSI6IkFDQ0VTUyJ9fQ.BQgno2Tz233VG530JUK6zlCVrAdeny1IvKQRswd6hVw';
                var refreshToken = (resp.refreshToken) ? resp.refreshToken : null;
                console.log(accessToken);
                localStorage.deviceHiveToken = accessToken;
                localStorage.deviceHiveRefreshToken = refreshToken;

                try {
                    var parsedJwt = parseJwt(accessToken);
                    localStorage.expiration = parsedJwt.payload.expiration;
                } catch (err) {
                    console.log(err);
                }

                var appUrl = app.f.prepareAbsolutePath(app.config.rootUrl);
                localStorage.lastActivity = (new Date()).valueOf();
                location.href = appUrl;
            },
            complete: function (xhr) {
                // prevent polling if error occur
                if (xhr.status >= 400) {
                     app.vent.trigger("notification", app.Enums.NotificationType.Error, xhr);
                     // return BEFORE running pollUpdates again
                     return;
                }
            },
            timeout: 30000
        });
    }
});

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}
