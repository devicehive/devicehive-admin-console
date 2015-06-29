//model is an app.Models.Equipment
app.Views.EquipmentListItem = Backbone.Marionette.ItemView.extend({
    events: {
        "click .delete-equip": "deleteEquipment",
        "click .edit-equip": "editEquipment",
        "click .save-equip": "saveEquipment",
        "click .cancel-equip": "cancelAction"
    },
    initialize: function () {
        this.bindTo(this.model, "change", function () {
            this.model.collection.sort();
        }, this);
    },
    template: "equipment-list-item-template",
    tagName: "tr",
    onRender: function () {
        if (this.model.isNew())
            this.showEditableAreas();
        else
            this.showValuesAreas();
    },
    deleteEquipment: function () {
        if (this.model.deviceClass.get("isPermanent") == false)
            if (confirm("Do you really want to delete this equipment? This change cannot be undone."))
                this.model.destroy({ error: function (model, response) {
                    app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
                }
                });
    },
    saveEquipment: function () {
        var name = this.$el.find(".name-equip").val();
        var code = this.$el.find(".code-equip").val();
        var type = this.$el.find(".type-equip").val();
        var data = this.$el.find(".data-equip").val();
        if (!this.model.setStrData(data)) { return; }


        var that = this;

        this.model.save({ name: name, code: code, type: type }, {
            error: function (mod, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            success: function (mod, response) {
                that.showValuesAreas();
            }
        });
    },
    cancelAction: function () {
        if (this.model.isNew())
            this.model.destroy();
        else
            this.render();
    },
    editEquipment: function () {
        if (this.model.deviceClass.get("isPermanent") != false) {
            return;
        }
        var $siblings = this.$el.siblings();
        this.showValuesAreasForElement($siblings);
        this.showEditableAreas();
    },
    showValuesAreasForElement: function ($el) {
        $el.find(".current-value").show();
        $el.find(".new-value").hide();
    },
    showValuesAreas: function () {
        this.showValuesAreasForElement(this.$el);
        if (this.model.deviceClass.get("isPermanent") == true)
            this.$el.find(".button").hide();
    },
    showEditableAreas: function () {
        this.$el.find(".new-value").show();
        this.$el.find(".current-value").hide();

        if (this.model.deviceClass.get("isPermanent") == true)
            this.$el.find(".button").hide();
    },
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });
        if (!_.has(data, "name"))
            data["name"] = "";
        if (!_.has(data, "code"))
            data["code"] = "";
        if (!_.has(data, "type"))
            data["type"] = "";
        //add backslashes to &quot; entity created during escaping 
        if (_.has(data, "data") && !_.isNull(data.data))
            data["data"] = JSON.stringify(data.data).replace(/&quot;/g,"\\&quot;");
        else
            data["data"] = "";

        return data;
    }
});