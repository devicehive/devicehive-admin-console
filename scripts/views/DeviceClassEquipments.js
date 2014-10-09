//push app.Models.DeviceClass here
app.Views.DeviceClassEquipments = Backbone.Marionette.CompositeView.extend({
    triggers: {
        "click .close-equipments": "closeEquipments"
    },
    events: {
        "click .add-equipment": "addEquipment"
    },
    beforeRender: function () {
        this.$el.addClass("device-classes-edit panel");
    },
    onRender: function () {
        if (this.model.get("isPermanent") == true)
            this.$el.find(".add-equipment").hide();
    },
    template: "device-class-equipments-template",
    itemView: app.Views.EquipmentListItem,
    itemViewContainer: ".equipment-table-body",
    initialize: function () {
        //if no model specified - create new model.
        this.model.bind("change", function () { this.render(); }, this);
    },
    addEquipment: function () {
        if (this.model.get("isPermanent") == false)
            this.collection.add(new app.Models.Equipment({}, { deviceClass: this.model }));
    }
});

