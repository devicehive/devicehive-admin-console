app.Models.UserInNetwork = Backbone.AuthModel.extend({
    url: function () {
        return app.config.restEndpoint + '/user/' + this.get("UserId") + "/network/" + this.get("NetworkId");
    },
    isNew: function () {
        return (_.isUndefined(this.attributes.network) || _.isUndefined(this.attributes.network.id));
    }
});
