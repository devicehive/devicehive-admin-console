//model is a Backbone.Collection (??? or app.Models.Network)
app.Views.UserNetworkListItem = Backbone.Marionette.ItemView.extend({
    triggers: {
        "click .reject": "reject"
    },
    template: "user-network-list-item",
    tagName: "tr"
});

//model is an app.Model.User
app.Views.UserNetworks = Backbone.Marionette.CompositeView.extend({
    triggers: {
        "click .back": "backClicked"
    },
    initialize: function () {
        this.collection = this.model.get("networksCollection");
        this.bindTo(this, "itemview:reject", this.rejectChild);
    },
    rejectChild: function (childView) {
        this.model.removeNetwork(childView.model.get("id"));
    },
    itemView: app.Views.UserNetworkListItem,
    emptyView: Backbone.Marionette.ItemView.extend({template:"user-networks-empty-template",tagName:"tr"}),
    template: "user-networks-template",
    itemViewContainer: "tbody"
});

