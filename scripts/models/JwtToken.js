app.Models.JwtToken = Backbone.AuthModel.extend({
    initialize: function (params) {
        this.getJwtTokenWithCredentials(params);
    },
    refreshJwtToken: function() {
        var getTokenUrl = app.config.restEndpoint + '/token';
        var refreshToken = (localStorage.deviceHiveRefreshToken) ? localStorage.deviceHiveRefreshToken : null;

        if(refreshToken) {
            var params = {
                'refreshToken' : refreshToken
            };

            $.ajax({
                type: "GET",
                url: getTokenUrl,
                async: false,
                dataType: "json",
                contentType: "application/json",
                crossDomain: true,
                cache: false,
                data: JSON.stringify(params),
                headers: Backbone.AuthModel.prototype.authHeader(),
                success: function (resp) {
                    var accessToken = (resp.accessToken) ? resp.accessToken : null;
                    var refreshToken = (resp.refreshToken) ? resp.refreshToken : null;
                    localStorage.deviceHiveToken = accessToken;
                    localStorage.deviceHiveRefreshToken = refreshToken;

                    try {
                        var parsedJwt = app.parseJwt(accessToken);
                        localStorage.expiration = parsedJwt.payload.expiration;
                    } catch (err) {
                        console.log(err);
                    }

                    localStorage.lastActivity = (new Date()).valueOf();
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
    },
    getJwtTokenWithCredentials: function(params) {
        var getTokenUrl = app.config.restEndpoint + '/token';
        if(params) {
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
                    var refreshToken = (resp.refreshToken) ? resp.refreshToken : null;
                    localStorage.deviceHiveToken = accessToken;
                    localStorage.deviceHiveRefreshToken = refreshToken;

                    try {
                        var parsedJwt = app.parseJwt(accessToken);
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
    },

    generateDeviceJwtTokens: function(userPayload, callback) {
        var getTokenCreateUrl = app.config.restEndpoint + '/token/create';

        if(app.isLoggedIn() && userPayload) {
            $.ajax({
                type: "POST",
                url: getTokenCreateUrl,
                async: true,
                contentType: "application/json",
                crossDomain: true,
                cache: false,
                data: JSON.stringify(userPayload),
                headers: Backbone.AuthModel.prototype.authHeader(),
                success: function (tokens) {
                    callback(tokens);
                    return;
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
            })
        } else {
            return 'Not valid params';
        }

    }
});
