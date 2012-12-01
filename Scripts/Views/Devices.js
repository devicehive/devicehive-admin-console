//model is an app.Models.Networks
app.Views.DeviceListItem = Backbone.Marionette.ItemView.extend({
    triggers: {
        "click .detail": "showDetail"
    },
    events: {
        "click .edit": "editDevice",
        "click .delete": "deleteDevice",
        "click .save": "saveDevice",
        "click .cancel": "cancelAction"
    },
    initialize: function (options) {
        this.model.bind("change", function () { this.render(); }, this);

        this.networksList = options.networks;
        this.classesList = options.classes;
    },
    template: "device-list-item-template",
    tagName: "tr",
    onRender: function () {
        this.showValuesAreas();
    },
    deleteDevice: function () {
        if (confirm("are you realy wont to delete this device? All collected information will be lost."))
            this.model.destroy({ error: function (model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            }
            });
    },
    saveDevice: function () {
        var name = this.$el.find(".new-device-name").val();
        var status = this.$el.find(".new-device-status").val();

        var netwId = this.$el.find(".new-device-network :selected").val();
        var classId = this.$el.find(".new-device-class :selected").val();

        var network = (netwId == 0) ? null : this.networksList.find(function (net) { return net.id == netwId; });
        var dclass = this.classesList.find(function (cls) { return cls.id == classId; });

        var that = this;
        this.model.save({ name: name, status: status, network: network, deviceClass: dclass }, {
            success: function () {

            }, error: function (model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            wait: true
        });

    },
    cancelAction: function () {
        this.showValuesAreas();
    },
    editDevice: function () {
        this.showEditableAreas();
    },
    showValuesAreas: function () {
        this.$el.find(".current-value").show();
        this.$el.find(".new-value").hide();
    },
    showEditableAreas: function () {
        this.$el.find(".new-value").show();
        this.$el.find(".current-value").hide();
    },
    serializeData: function () {
        var base = this.model.toJSON({ escape: true });
        if (!_.has(base, "network"))
            base["network"] = { id: 0, name: "No network" };

        base.networks = [{ id: 0, name: "No network"}];
        base.networks = base.networks.concat(this.networksList.toJSON({ escape: true }));

        base.classes = this.classesList.toJSON({ escape: true });
        return base;
    }
});

//collection is an app.Models.NetworksCollection
app.Views.Devices = Backbone.Marionette.CompositeView.extend({
    itemView: app.Views.DeviceListItem,
    itemViewOptions: function () {
        return {
            networks: this.networks,
            classes: this.classes
        };
    },
    emptyView: Backbone.Marionette.ItemView.extend(
        {
            render: function () {
                this.$el.html("<td colspan='5'>there are no devices has been registered yet.</td>");
                return this;
            },
            tagName: "tr"
        }),
    template: "devices-template",
    itemViewContainer: "tbody",
    initialize: function (options) {
        this.networks = options.networks;
        this.classes = options.classes;
    }
});

