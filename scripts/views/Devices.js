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
        this.bindTo(this.model,"change", function () { this.render(); }, this);

        this.networksList = options.networks;
        this.classesList = options.classes;
        this.classEditable = options.classEditable;
    },
    template: "device-list-item-template",
    tagName: "tr",
    onRender: function () {
        this.showValuesAreas();
    },
    deleteDevice: function () {
        if (confirm("Do you really want to delete this device? All collected information will be lost."))
            this.model.destroy({ error: function (model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            }
            });
    },
    saveDevice: function () {
        var data = this.$el.find(".new-device-data").val();
        if (!this.model.setStrData(data)) { return; }

        var netwId = this.$el.find(".new-device-network :selected").val();
        var network = (netwId == 0) ? null : this.networksList.find(function (net) { return net.id == netwId; }).toJSON({ escape: true });

        var changes = {
            name: this.$el.find(".new-device-name").val(),
            status: this.$el.find(".new-device-status").val(),
            network: network
        };

        if (this.classEditable) {
            var classId = this.$el.find(".new-device-class :selected").val();
            changes.deviceClass =
                this.classesList.find(function (cls) { return cls.id == classId; }).toJSON({ escape: true });
        }

        var that = this;
        this.model.save(changes, {
            success: function () {
                that.render();
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
        //add backslashes to &quot; entity created during escaping 
        if (_.has(base, "data") && !_.isNull(base.data))
            base["data"] = JSON.stringify(base.data).replace(/&quot;/g,"\\&quot;");
        else
            base["data"] = "";

        if (base.network == null)
            base["network"] = { id: 0, name: "---No network---" };

        base.networks = [{ id: 0, name: "---No network---"}];
        base.networks = base.networks.concat(this.networksList.toJSON({ escape: true }));

        base.classEditable = this.classEditable;
        base.classes = base.classEditable ? this.classesList.toJSON({ escape: true }) : [];
        return base;
    }
});

//collection is an app.Models.NetworksCollection
app.Views.Devices = Backbone.Marionette.CompositeView.extend({
    itemView: app.Views.DeviceListItem,
    itemViewOptions: function () {
        return {
            networks: this.networks,
            classes: this.classes,
            classEditable: this.classEditable
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
        this.classEditable = options.classEditable;
    }
});

