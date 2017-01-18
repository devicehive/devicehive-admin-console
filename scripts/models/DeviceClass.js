app.Models.DeviceClass = Backbone.AuthModel.extend({
    urlRoot: function () {
        return app.config.restEndpoint + "/device/class";
    },
    defaults: { equimpent: [], isPermanent: false, version: 1, offlineTimeout: null },
    //getEquipments: function (success, error) {
    //    if (this.equipmentColl != null) {
    //        if (_.isFunction(success))
    //            success(this.equipmentColl);
    //    }
    //    else {
    //        var that = this;
    //        this.equipmentColl = new app.Models.EquipmentsCollection({}, { deviceClass: this });
    //        this.equipmentColl.fetch({ success: function (coll, response) {
    //            if (_.isFunction(success))
    //                success(coll);
    //        }
    //        });
    //    }
    //    return this.equipmentColl;
    //},
    setters: {
        offlineTimeout: function (value) {
            if (!value || value == "")
                return null;
            return parseInt(value);
        }
    },
    validate: function (attrs) {
        var integer = /^[0-9]*$/;
        if (attrs.offlineTimeout == "")
            attrs.offlineTimeout = null;
            
        if (attrs.offlineTimeout) {
            if (!integer.test(attrs.offlineTimeout)) {
                return "offline timeout should be integer value";
            }
        }
    },
    setStrData: function (value) {
        try {
            this.set("data", jQuery.parseJSON(value));
            return true;
        } catch (e) {
            app.vent.trigger("notification", app.Enums.NotificationType.Error, "Valid javascript object should be entered");
            return false;
        }
    }
});

app.Models.DeviceClassesCollection = Backbone.AuthCollection.extend({
    url: function () {
        return app.config.restEndpoint + "/device/class";
    },
    model: app.Models.DeviceClass,
    comparator: function (dclass) {
        var name = dclass.get("name");
        if (name)
            return name.toLowerCase();
        else
            return 1000000;
    }
});
