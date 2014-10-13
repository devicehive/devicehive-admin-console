Backbone.AuthModel = Backbone.Model.extend({
    authHeader: function () { 
        if (sessionStorage.user && sessionStorage.password) {
            return {
                'Authorization': 'Basic '+btoa(sessionStorage.user+':'+sessionStorage.password)
            };
        } else {
            return {};
        }
    },
    sync: function(method, model, options) {
        console.log('sync: method %o model %o, options %o', method, model, options);
        options = options ? options : {};
        options.headers = _.extend(options.headers ? options.headers : {}, this.authHeader());
        options || (options = {});
        return Backbone.sync.apply(this, [method, model, options]);
    }
});

Backbone.AuthCollection = Backbone.Collection.extend({
    sync: function(method, model, options) {
        console.log('sync collection: method %o model %o, options %o', method, model, options);
        options = options ? options : {};
        options.headers = _.extend(options.headers ? options.headers : {}, Backbone.AuthModel.prototype.authHeader());
        options || (options = {});
        return Backbone.sync.apply(this, [method, model, options]);
    }
});
