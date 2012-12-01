//model is an app.Models.Networks
app.Views.DeviceEquipmentListItem = Backbone.Marionette.ItemView.extend({
    initialize: function () {
        this.model.bind("change", function () {
            this.render();
        }, this);
    },
    template: "device-equipment-list-item-template",
    tagName: "tr",
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });

        if (_.has(data, "parameters"))
            data["parameters"] = JSON.stringify(data.parameters);
        else
            data["parameters"] = "";

        if (_.has(data, "timestamp"))
            data["refreshTime"] = app.f.parseUTCstring(data.timestamp).format("mm/dd/yyyy HH:MM:ss");
        else
            data["refreshTime"] = "never";

        return data;
    }
});

//collection is an app.Models.DeviceEquipmentsCollection
app.Views.DeviceEquipments = Backbone.Marionette.CompositeView.extend({
    itemView: app.Views.DeviceEquipmentListItem,
    template: "device-equipments-list-template",
    initialize: function () {
        var that = this;
        this.collection = new app.Models.DeviceEquipmentsCollection({ }, { device: this.model });
    },
    itemViewContainer: "tbody"
});

