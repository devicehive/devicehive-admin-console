app.Views.GrantListItem = Backbone.Marionette.ItemView.extend({
    events: {
        "click .revoke": "revokeAccess"
    },
    initialize: function (options) {
        this.bindTo(this.model,"change", function () { this.render(); }, this);
        this.grants = options.grants;
        this.networks = options.networks;
    },
    template: "grant-list-item-template",
    tagName: "tr",
    revokeAccess: function(e) {
        if (confirm('Revoke access for this grant?')) {
            this.model.destroy({ error: function(model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            }});
        }
    },
    serializeData: function () {
        var data = {};
        data.grant = this.model.toJSON({ escape: true });
        data.networks = this.networks;
        return data;
    }
});

app.Views.Grants = Backbone.Marionette.CompositeView.extend({
    itemView: app.Views.GrantListItem,
    itemViewOptions: function () {
        return {
            grants: this.grants,
            networks: this.networks
        };
    },
    initialize: function(options) {
        this.networks = options.networks;
    },
    emptyView: Backbone.Marionette.ItemView.extend(
        {
            render: function () {
                this.$el.html("<td colspan='5' class='text-center'>No grants has been issued yet</td>");
                return this;
            },
            tagName: "tr"
        }),
    template: "grants-template",
    itemViewContainer: "tbody",
});

