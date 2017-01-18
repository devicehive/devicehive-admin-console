app.Models.DeviceEquipment = Backbone.AuthModel.extend({
    initialize: function (attributes, options) {
        if (!_.isUndefined(attributes) && _.has(attributes, "device")) {
            this.device = attributes.device;
        }
        else if (!_.isUndefined(options) && _.has(options, "device")) {
            this.device = options.device;
        } else if (!_.isUndefined(this.collection) && _.has(this.collection, "device")) {
            this.device = this.collection.device;
        } else{
            var err = new Error("Device should be specified to define device equipment endpoint");
            err.name = "Device equipment without device error";
            throw err;
        }
    },
    urlRoot: function () {
        return app.config.restEndpoint + '/device/' + this.device.get("id") + "/equipment";
    }
});

app.Models.DeviceEquipmentsCollection = Backbone.AuthCollection.extend({
    initialize: function (attributes, options) {
        if (!_.isUndefined(attributes) && _.has(attributes, "device")) {
            this.device = attributes.device;
        }
        else if (!_.isUndefined(options) && _.has(options, "device")) {
            this.device = options.device;
        } else {
            var err = new Error("Device should be specified to define device equipment endpoint");
            err.name = "Device equipment without device error";
            throw err;
        }
    },
    url: function () {
        return app.config.restEndpoint + '/device/' + this.device.get("id") + "/equipment";
    },
    //override fetch to merge equipment description with equipment states
    fetch: function (options) {
        options = options ? _.clone(options) : {};
        if (options.parse === undefined) options.parse = true;
        var collection = this;
        var success = options.success;

        var dc = new app.Models.DeviceClass({ id: this.device.get("deviceClass").id });
        var that = this;

        //fetch the existed equipments of device class, device placed in.
        dc.fetch({
            success: function () {
                that.equipTypes = dc.get("equipment");

                options.success = function (resp, status, xhr) {
                    collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
                    if (success) success(collection, resp);
                };

                options.error = Backbone.wrapError(options.error, collection, options);
                (that.sync || Backbone.sync).call(that, 'read', that, options);
            }
        });

        return this;
    },
    parse: function (resp, xhr) {
        var that = this;

        var newResp = [];

        //map the DeviceEquipment(which is object that describe state of equipment)
        //with the Equipment(which describe the equipment type) of the device.deviceClass
        _.each(that.equipTypes, function (type) {
            var curItem = _.clone(type);
            delete curItem.id;

            _.extend(curItem, _.find(resp, function (equ) {
                return curItem.code == equ.id;
            }));
            newResp.push(curItem);
        });
        
        return newResp;
    },
    model: app.Models.DeviceEquipment,
    comparator: function (equip) {
        var name = equip.get("name");
        if (name)
            return name.toLowerCase();
        else
            return 1000000;
    }
});
