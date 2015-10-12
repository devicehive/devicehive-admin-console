//model is an app.Models.DeviceClass
app.Views.DeviceClassesListItem = Backbone.Marionette.ItemView.extend({
    //triggers: {
    //    "click .show-equipments": "showEquipments"
    //},
    events: {
        "click .delete": "deleteClass",
        "click .edit": "editClass",
        "click .save": "saveClass",
        "click .close": "closeEdition",
        "click .copy": "copyClass"
    },
    initialize: function () {
        this.bindTo(this.model, "change", function () {
            this.model.collection.sort();
        }, this);
    },
    onRender: function () {
        if (this.model.isNew())
            this.showEditableAreas();
        else
            this.showValuesAreas();
    },
    template: "device-class-list-item-template",
    tagName: "tr",
    editClass: function () {
        // show value fields for rest of elements (siblings)
        var $siblings = this.$el.siblings();
        this.showValuesAreasForElement($siblings);
        // show edit fields for this element
        this.showEditableAreas();
    },
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });

		//add backslashes to &quot; entity created during escaping   
        if (_.has(data, "data") && !_.isNull(data.data))
            data["data"] = JSON.stringify(data.data).replace(/&quot;/g,"\\&quot;");
        else
            data["data"] = "";

        if (data.offlineTimeout == null)
            data.offlineTimeout = "";
        return data;
    },
    closeEdition: function () {
        if (this.model.isNew())
            this.model.destroy();
        else
            this.render();
    },
    showEditableAreas: function () {
        this.$el.find(".value-field").hide();
        this.$el.find(".new-value").show();
        this.$el.find(".isPermanent").removeAttr("disabled");

    },
    showValuesAreas: function () {
        this.showValuesAreasForElement(this.$el);
    },
    showValuesAreasForElement: function($el) {
        $el.find(".new-value").hide();
        $el.find(".value-field").show();
        $el.find(".isPermanent").attr("disabled", "disabled");
    },
    saveClass: function () {
        var name = this.$el.find(".new-name").val();
        var version = this.$el.find(".new-version").val();
        var isPermanent = this.$el.find(".isPermanent").is(":checked");
        var offlineTimeout = this.$el.find(".new-timeout").val();
        var data = this.$el.find(".new-data").val();
        if (!this.model.setStrData(data)) { return; }

        var options = {
            name: name,
            version: version,
            isPermanent: isPermanent,
            offlineTimeout: offlineTimeout
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
    deleteClass: function () {
        if (confirm("Do you really want to delete this device class? This change can not be undone."))
            this.model.destroy({
                error: function (model, response) {
                    app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
                }
            });
    },
    copyClass: function () {
        var that = this;
        var oldProps = this.model.toJSON();
        oldProps.version = oldProps.version + "(copy)";
        delete oldProps.id;

        //copy device class
        var newDc = new app.Models.DeviceClass(oldProps);

        newDc.save(null, {
            success: function () {

                //render device class for edition if there is no equimpents attached

                that.model.collection.add(newDc);
                that.model.collection.sort();

            },
            error: function (model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            }
        });

    }
});

//collection is an app.Models.DeviceClassesCollection
app.Views.DeviceClasses = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .add": "addNewClass"
    },
    itemView: app.Views.DeviceClassesListItem,
    template: "device-class-template",
    emptyView: Backbone.Marionette.ItemView.extend(
        {
            render: function () {
                this.$el.html("<td colspan='6'>there are no device classes has been registered yet. Create first one!</td>");
                return this;
            },
            tagName: "tr"
        }),
    itemViewContainer: "tbody",
    addNewClass: function () {
        this.collection.add(new app.Models.DeviceClass());
    }
});

