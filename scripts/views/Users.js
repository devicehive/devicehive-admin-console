//here is inner view for Users collection
app.Views.UserListItem = Backbone.Marionette.ItemView.extend({
    tagName: "tr",
    triggers: {
        "click .networks": "networksClicked",
        "click .edit": "editClicked",
        "click .delete": "deleteClicked",
        "click .accessKeys": "accessKeysClicked"
    },
    template: "user-list-item-template",
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });
        if (_.has(data, "status"))
            data.status = app.Enums.UserStatus.getName(data.status);
        else
            data.status = "";
        if (_.has(data, "data") && !_.isNull(data.data))
            data["data"] = JSON.stringify(data.data);
        else
            data["data"] = "";

        if (_.has(data, "role"))
            data.role = app.Enums.UserRole.getName(data.role);
        else
            data.role = "";


        if (_.has(data, "lastLogin") && !_.isEmpty(data.lastLogin))
            data.lastLogin = app.f.parseUTCstring(data.lastLogin).format("mm/dd/yyyy HH:MM:ss");
        else
            data.lastLogin = "";

        if (!_.has(data, "googleLogin") || _.isEmpty(data.googleLogin))
            data.googleLogin = "";

        if (!_.has(data, "facebookLogin") || _.isEmpty(data.facebookLogin))
            data.facebookLogin = "";

        if (!_.has(data, "githubLogin") || _.isEmpty(data.githubLogin))
            data.githubLogin = "";

        return data;
    }
});

//push app.Models.UsersCollection here
app.Views.Users = Backbone.Marionette.CompositeView.extend({
    triggers: {
        "click .add": "addClicked"
    },
    initialize: function () {
        this.bindTo(this.collection, "change:selected", this.renderCollection);
    },
    beforeRender: function () {
        this.$el.addClass("users");
    },
    itemView: app.Views.UserListItem,
    itemViewContainer: "tbody",
    template: "user-list-template"
});