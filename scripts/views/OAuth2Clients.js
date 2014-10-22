app.Views.OAuth2ClientListItem = Backbone.Marionette.ItemView.extend({
    events: {
        "click .delete": 'deleteClient'
    },
    deleteClient: function(e) {
        if (confirm('Delete this client?')) {
            this.model.destroy({ error: function(model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            }});
        }
    },
    initialize: function (options) {
        this.bindTo(this.model,"change", function () { this.render(); }, this);
    },
    template: "oauth2-client-list-item-template",
    tagName: "tr",
    serializeData: function () {
        var data = this.model.toJSON();
        return data;
    }
});

app.Views.OAuth2Clients = Backbone.Marionette.CompositeView.extend({
    itemView: app.Views.OAuth2ClientListItem,
    emptyView: Backbone.Marionette.ItemView.extend(
        {
            render: function () {
                this.$el.html("<td colspan='5' class='text-center'>No oauth clients</td>");
                return this;
            },
            tagName: "tr"
        }),
    template: "oauth2-client-template",
    itemViewContainer: "tbody",
});

