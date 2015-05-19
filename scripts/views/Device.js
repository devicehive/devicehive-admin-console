// model app.Models.Device
app.Views.Device = Backbone.Marionette.ItemView.extend({
    events: {
        "click .edit-device": "editDevice",
        "click .save-device": "saveDevice",
        "click .close-action": "closeAction"
    },
    initialize: function (options) {
        //lists are necessary to render the select boxes throught editing
        this.networksList = options.networks;
        this.classesList = options.classes;
        this.classEditable = options.classEditable;
    },
    onRender: function () {
        this.closeAction();
        this.$el.addClass("device-detail-view panel");
    },
    template: "device-template",
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
    },
    editDevice: function () {
        this.$el.find(".device-value").hide();
        this.$el.find(".edit-device").hide();

        this.$el.find(".save-device").show();
        this.$el.find(".new-value").show();
        this.$el.find(".close-action").show();
    },
    closeAction: function () {
        this.$el.find(".new-value").hide();
        this.$el.find(".save-device").hide();
        this.$el.find(".close-action").hide();

        this.$el.find(".device-value").show();
        this.$el.find(".edit-device").show();
    },
    saveDevice: function () {
        var data = this.$el.find(".new-value.data").val();
        if (!this.model.setStrData(data)) { return; }

        var netwId = this.$el.find(".new-value.network :selected").val();
        var network = (netwId == 0) ? null : this.networksList.find(function (net) { return net.id == netwId; }).toJSON({ escape: true });

        var changes = {
            name: this.$el.find(".new-value.name").val(),
            status: this.$el.find(".new-value.status").val(),
            network: network,
            isBlocked: this.$el.find('.new-value select[name=isBlocked]').val() == "1" ? true : false
        };

        if (this.classEditable) {
            var classId = this.$el.find(".new-value .dclass :selected").val();
            changes.deviceClass =
                this.classesList.find(function (cls) { return cls.id == classId; }).toJSON({ escape: true });
        }

        var that = this;
        this.model.save(changes, {
            success: function () {
                that.render();
            }, error: function (model, response) {
                that.render();
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            wait: true
        });

    }
});




