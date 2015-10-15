// AuthModel is intended to be a base model for entities that requires http basic auth for ajax requests
Backbone.AuthModel = Backbone.Model.extend({
    authHeader: function () {
        if (localStorage.deviceHiveToken) {
           return {
               'Authorization': 'Bearer ' + localStorage.deviceHiveToken
           };
        } else {
            return {};
        }
    },
    //override sync method which is called on any ajax requests
    sync: function(method, model, options) {
        //console.log('sync method %o model %o options %o', method, model, options);
        var timestamp = (new Date().valueOf());
        if (localStorage && localStorage.lastActivity) {
            // logout user if he/she was inactive for 30 minutes or more
            if (localStorage.lastActivity < timestamp - (30*60*1000)) {
                unauthorizedHandler();
                return;
            }
        }
        localStorage.lastActivity = timestamp;
        options || (options = {});
        // keep original error handler and make wrapper to handle 401 responses
        var errorHandler = options.error || function(){};
        options.error = function(reply) {
            if (reply.status == 401) {
                unauthorizedHandler();
            } else {
                errorHandler.apply(this, arguments);
            }
        };
        options.headers = _.extend(options.headers ? options.headers : {}, this.authHeader());
        return Backbone.sync.apply(this, [method, model, options]);
    }
});

// helper function to perform correct logout procedure
var unauthorizedHandler = function() {
    // save current backbone history fragment before logging out and redirecting to login screen
    if (sessionStorage && !sessionStorage.requestFragment) {
        sessionStorage.requestFragment = Backbone.history.fragment;
    }
    Backbone.history.navigate('logout', {trigger: true});
};

Backbone.AuthCollection = Backbone.Collection.extend({
    sync: Backbone.AuthModel.prototype.sync,
    authHeader: Backbone.AuthModel.prototype.authHeader
});
