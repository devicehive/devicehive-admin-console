app.Views.OAuth2ClientListItem = Backbone.Marionette.ItemView.extend({
    events: {
        "click .delete": 'deleteClient',
        "click .edit": 'editClient',
        "click .save": 'saveClient',
        "click .close": 'closeClient'
    },
    deleteClient: function(e) {
        if (confirm('Delete this client?')) {
            this.model.destroy({ error: function(model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            }});
        }
    },
    editClient: function(e) {
        this.showEditableAreas();
    },
    saveClient: function(e) {
        var name = this.getValue('name');
        var domain = this.getValue('domain');
        var subnet = this.getValue('subnet');
        var redirectUri = this.getValue('redirect-uri');
        var oauthId = this.getValue('oauth-id');
        var options = {
            name: name,
            domain: domain,
            subnet: subnet ? subnet : null,
            redirectUri: redirectUri,
            oauthId: oauthId
        };
        var that = this;
        this.model.save(options, {
            success: function() {
                that.render();
            },
            error: function (model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            wait: true
        });
    },
    closeClient: function() {
        this.showValuesAreas();
        if (this.model.isNew()) {
            this.model.destroy();
        }
    },
    getValue: function (item) {
        return this.$el.find("[name=new-"+item+"]").val();
    },
    onRender: function () {
        if (this.model.isNew()) {
            this.showEditableAreas();
        } else {
            this.showValuesAreas();
        }
    },
    showEditableAreas: function () {
        this.$el.find(".value-field").hide();
        this.$el.find(".new-value").show();
    },
    showValuesAreas: function () {
        this.$el.find(".value-field").show();
        this.$el.find(".new-value").hide();
    },
    initialize: function (options) {
        this.bindTo(this.model,"change", function () { this.render(); }, this);
    },
    template: "oauth2-client-list-item-template",
    tagName: "tr",
    serializeData: function () {
        var data = this.model.toJSON();
        if (data.subnet === null) {
            data.subnet = '';
        }
        return data;
    }
});

app.Views.OAuth2Clients = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .add": 'addClient'
    },
    addClient: function(e) {
        this.collection.add(new app.Models.OAuthClient());
    },
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

