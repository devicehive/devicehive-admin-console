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
        if (_.has(data.grant, "timestamp") && !_.isEmpty(data.grant.timestamp)) {
            data.grant["timestamp"] = app.f.parseUTCstring(data.grant.timestamp).format("mm/dd/yyyy HH:MM:ss");
        }
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
                this.$el.html("<td colspan='6' class='text-center'>No grants has been issued yet</td>");
                return this;
            },
            tagName: "tr"
        }),
    template: "grants-template",
    itemViewContainer: "tbody",
});

