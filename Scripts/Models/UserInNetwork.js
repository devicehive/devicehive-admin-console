app.Models.UserInNetwork = Backbone.Model.extend({
    url: function () {
        return app.restEndpoint + '/user/' + this.get("UserId") + "/network/" + this.get("NetworkId");
    },
    isNew: function () {
        return (_.isUndefined(this.attributes.network) || _.isUndefined(this.attributes.network.id));
    }
});