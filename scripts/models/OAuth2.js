app.Models.OAuth2Scope = Backbone.Model.extend({
    defaults: {name: ''}
});

app.Models.OAuth2ScopeCollection = Backbone.Collection.extend({
    model: app.Models.OAuth2Scope,
});

app.Models.OAuth2 = Backbone.Model.extend({
    getUrlParam: function(name) {
        return decodeURIComponent(((RegExp(name + '=' + '(.+?)(&|$)', 'i').exec(location.search) || [, ""])[1]).replace(/\+/g,' '));
    },
    defaults: {
        client: {}
    },
    initialize: function() {
        this.set('client_id', this.getUrlParam("client_id"));
        this.set('redirect_uri', this.getUrlParam("redirect_uri"));
        this.set('response_type', this.getUrlParam("response_type"));
        this.set('scope', this.getUrlParam("scope"));
        this.set('state', this.getUrlParam("state"));
        this.set('access_type', this.getUrlParam("access_type") == "offline" ? "Offline" : "Online");
    },
    checkParameters: function() {
        var p = this.attributes;
        return p.client_id && p.redirect_uri && p.response_type && p.scope;
    },
    parseScope: function (scope) {
        return $.map(scope.split(' '), function (s) {
            switch (s) {
                case "GetNetwork": return "View Networks";
                case "GetDevice": return "View Devices";
                case "GetDeviceState": return "Receive Device State";
                case "GetDeviceNotification": return "Receive Device Notifications";
                case "GetDeviceCommand": return "Receive Device Commands";
                case "RegisterDevice": return "Register Devices";
                case "CreateDeviceNotification": return "Create Device Notifications";
                case "CreateDeviceCommand": return "Create Device Commands";
                case "UpdateDeviceCommand": return "Update Device Commands";
                default: return null;
            }
        });
    },
    getScopeCollection: function() {
        var scopeCollection = this.get('scopeCollection');
        if (scopeCollection) {
            return scopeCollection;
        }
        scopeCollection = new app.Models.OAuth2ScopeCollection(_.map(this.parseScope(this.get('scope')), function(scope){return {name: scope};}));
        this.set('scopeCollection', scopeCollection);
        return scopeCollection;
    },
    authRequest: function(options) {
        var opts = _.extend({}, this.defaultRequest, options, {headers: Backbone.AuthModel.prototype.authHeader()});
        $.ajax(opts);
    },
    defaultRequest: {
        type: 'GET',
        cache: false,
    },
    getUrl: function(part) {
        return app.config.restEndpoint+part;
    },
    checkUser: function() {
        if (app.hasCredentials()) {
            app.trigger('login');
        } else {
            app.trigger('needAuth');
        }
    },
    getClients: function() {
        var options = _.extend({}, this.defaultRequest, {url: this.getUrl('/oauth/client?oauthId='+this.get('client_id'))});
        var self = this;
        options.success = function(resp) {
            if (resp[0]) {
                self.set('client', resp[0]);
                if (self.get('response_type') == 'token' && resp[0].redirectUri != self.get('redirect_uri')) {
                    app.vent.trigger('notification', app.Enums.NotificationType.Error, {}, 'Redirect URI mismatch');
                    return;
                } else {
                    // oauth client exists, let's proceed to user verification
                    self.checkUser();
                }
            } else {
                app.vent.trigger('notification', app.Enums.NotificationType.Error, resp, 'No OAuth2 client with id '+self.get('client_id'));
            }
        };
        options.error = function(resp) {
            app.vent.trigger('notification', app.Enums.NotificationType.Error, resp, 'Failed to get OAuth2 client');
        };
        $.ajax(options);
    },
    capitalize: function(s) {
        return s[0].toUpperCase() + s.substring(1);
    },
    getGrants: function() {
        var self = this;
        var options = _.extend({}, this.defaultRequest, {
            url: this.getUrl('/user/current/oauth/grant'),
            data: {
                clientOAuthId: this.get('client_id'),
                type: this.capitalize(this.get('response_type')),
                scope: this.get('scope'),
                redirectUri: this.get('redirect_uri'),
                accessType: this.get('access_type')
            }
        });
        options.success = function(resp) {
            if ( !resp[0] ) {
                // no grant exist. proceed to grant screen
                Backbone.history.navigate('grant', { trigger: true });
            } else {
                self.updateGrant(resp[0]);
            }
        };
        options.error = function(resp) {
            app.trigger('needAuth');
        };
        this.authRequest(options);
    },
    updateGrant: function(grant) {
        if (!grant) {
            alert('No grant to update');
            return;
        }
        var self = this;
        var options = {
            url: this.getUrl('/user/current/oauth/grant/'+grant.id),
            type: "PUT",
            contentType: 'application/json',
            data: '{}'
        };
        options.success = function(resp) {
            self.redirectBack(resp);
        };
        options.error = function(resp) {
            app.vent.trigger('notification', app.Enums.NotificationType.Error, resp, 'Failed to update grant access');
        };
        this.authRequest(options);
    },
    requestGrant: function(networkIds) {
        var self = this;
        if (networkIds.length == 0) {
            networkIds = null;
        }
        var options = {
            url: this.getUrl('/user/current/oauth/grant'),
            type: "POST",
            contentType: 'application/json',
            data: JSON.stringify({
                client: {oauthId: this.get('client_id')},
                type: this.capitalize(this.get('response_type')),
                accessType: this.get('access_type'),
                redirectUri: this.get('redirect_uri'),
                scope: this.get('scope'),
                networkIds: networkIds
            })
        };
        //update existing grant instead of creating new one
        if (self.grant) {
            options.url += '/'+self.grant.id;
            options.type = "PUT";
        }
        options.success = function(resp) {
            self.redirectBack(resp);
        };
        options.error = function(resp) {
            app.vent.trigger('notification', app.Enums.NotificationType.Error, resp, 'Failed to grant access');
        };
        this.authRequest(options);
    },
    redirectBack: function(resp) {
        var targetUrl = this.get('redirect_uri');
        var query;
        switch(this.get('response_type')) {
            case 'code':
            if (resp.authCode) {
                query = 'code='+encodeURIComponent(resp.authCode);
            }
            break;
            case 'token':
            if (resp.accessKey && resp.accessKey.key) {
                query = 'token_type=Bearer&access_token='+encodeURIComponent(resp.accessKey.key);
            }
            break;
        }
        if (query) {
            location.replace(targetUrl+'?'+query);
            return;
        }
        app.vent.trigger('notification', app.Enums.NotificationType.Error, resp, 'Failed to identify parameters for redirect_uri');
    }
});
