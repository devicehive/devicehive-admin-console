//model is an app.Models.Networks
app.Views.NetworkListItem = Backbone.Marionette.ItemView.extend({
    events: {
        "click .delete": "deleteNetwork",
        "click .edit": "editNetwork",
        "click .save": "saveNetwork",
        "click .cancel": "cancelAction"
    },
    initialize: function () {
        this.bindTo(this.model,"change", function () {
            this.model.collection.sort();
        }, this);
    },
    template: "network-list-item-template",
    tagName: "tr",
    onRender: function () {
        if (app.hasRole(app.Enums.UserRole.Administrator)) {
            if (this.model.isNew())
                this.showEditableAreas();
            else
                this.showValuesAreas();
        }
        else {
            this.showValuesAreas(false);
        }
    },
    deleteNetwork: function () {
        if (confirm("Do you really want to delete this network? All associations with users will be lost"))
            this.model.destroy({ error: function (model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            wait: true
            });
    },
    saveNetwork: function () {
        var name = this.$el.find("#new-network-name").val();
        var desc = this.$el.find("#new-network-description").val();
        var key = this.$el.find("#new-network-key").val();
        if (_.isEmpty(key))
            key = null;

        var that = this;
        this.model.save({ name: name, description: desc, key: key }, {
            success: function () {
                that.render();
            }, error: function (model, response) {
                that.render();
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            wait: true
        });

    },
    cancelAction: function () {
        if (this.model.isNew())
            this.model.destroy();
        else
            this.render();
    },
    editNetwork: function () {
        this.showEditableAreas();
    },
    showValuesAreas: function (canEdit) {
        this.$el.find(".current-value").show();
        this.$el.find(".new-value").hide();
        this.$el.find(".buttons-column>span.current-value").toggle(_.isUndefined(canEdit) || canEdit);
    },
    showEditableAreas: function () {
        this.$el.find(".new-value").show();
        this.$el.find(".current-value").hide();
    },
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });
        if (!_.has(data, "name"))
            data["name"] = "";
        if (!_.has(data, "description"))
            data["description"] = "";
        if (_.isEmpty(data.key))
            data.key = "";

        return data;
    }
});

//collection is an app.Models.NetworksCollection
app.Views.Networks = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .add": "addNetwork"
    },
    itemView: app.Views.NetworkListItem,
    emptyView: Backbone.Marionette.ItemView.extend(
        {
            render: function () {
                var text = app.hasRole(app.Enums.UserRole.Administrator)
                    ? "there are no networks has been registered yet. Create first one!"
                    : "there are no networks has been registered yet.";
                this.$el.html("<td colspan='4'>" + text + "</td>");
                return this;
            },
            tagName: "tr"
        }),
    template: "networks-template",
    itemViewContainer: "tbody",
    addNetwork: function () {
        this.collection.add(new app.Models.Network());
    },
    onRender: function () {
        this.$el.find(".add").toggle(app.hasRole(app.Enums.UserRole.Administrator));
    }
});

