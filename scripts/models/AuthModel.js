// AuthModel is intended to be a base model for entities that requires http basic auth for ajax requests
Backbone.AuthModel = Backbone.Model.extend({
    authHeader: function () {
        if (sessionStorage.userLogin && sessionStorage.userPassword) {
            return {
                'Authorization': 'Basic '+btoa(sessionStorage.userLogin+':'+sessionStorage.userPassword)
            };
        } else {
            return {};
        }
    },
    //override sync method wich is called on any ajax requests
    sync: function(method, model, options) {
        var timestamp = (new Date().valueOf());
        if (sessionStorage && sessionStorage.lastActivity) {
            if (sessionStorage.lastActivity < timestamp - (30*60*1000)) {
                Backbone.history.navigate('logout', {trigger: true});
                return;
            }
        }
        sessionStorage.lastActivity = timestamp;
        options || (options = {});
        // keep original error handler and make wrapper to handle 401 responses
        var errorHandler = options.error || function(){};
        options.error = function(reply) {
            if (reply.status == 401) {
                Backbone.history.navigate('logout', {trigger: true});
            } else {
                errorHandler.apply(this, arguments);
            }
        };
        options.headers = _.extend(options.headers ? options.headers : {}, this.authHeader());
        return Backbone.sync.apply(this, [method, model, options]);
    }
});

Backbone.AuthCollection = Backbone.Collection.extend({
    sync: Backbone.AuthModel.prototype.sync,
    authHeader: Backbone.AuthModel.prototype.authHeader
});
