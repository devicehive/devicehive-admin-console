//should use app.Models.Network
app.Views.NetworkOption = Backbone.Marionette.ItemView.extend({
    tagName: "option",
    template: "empty",
    onRender: function () {
        this.$el.attr("value", this.model.escape("id"));
        this.$el.html(this.model.escape("name"));
    }
});

//model: app.Models.User
//collection: app.Models.NetworksCollection
app.Views.AppendUserToNetwork = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .accept": "append"
    },
    itemView: app.Views.NetworkOption,
    template: "user-networks-append-template",
    itemViewContainer: "#registered-networks",
    append: function () {
        var netValue = this.$el.find("#registered-networks :selected").val();
        var found = this.collection.find(function (curColl) {
            return curColl.get("id") == netValue;
        });

        if (found != null)
            this.model.addNetwork(found);
    }
});

