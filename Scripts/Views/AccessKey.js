// model is AccessKeyPermission
app.Views.AccessKeyPermissionEditListItem = Backbone.Marionette.ItemView.extend({
    events: {
        "click .remove-network": "removeNetwork",
        "click .remove-device": "removeDevice",
        "click .add-device": "addDevice",
        "click .add-network": "addNetwork"
    },
    triggers: {
        "click .remove-access-key-permission": "removePermission"
    },
    template: "access-key-permission-edit-list-item-template",
    tagName: "tr",
    initialize: function(options) {
        this.networks = options.networks;
        this.devices = options.devices;
        this.bindTo(this.model, "change", this.render);
    },
    serializeData: function() {
        var data = this.model.toJSON({ escape: true });
        data.cid = this.model.cid;
        var initArray = function(obj, keys) {
            _.each(keys, function(item) { if (!_.has(obj, item) || obj[item] == null) { obj[item] = []; } });
        };
        initArray(data, ["domains", "subnets", "actions", "networkIds", "deviceGuids"]);
        data.networks = this.networks;
        data.devices = this.devices;
        data.availableActions = app.Models.AccessKeyPermission.actions;
        return data;
    },
    updateModel: function() {
        return true;
    },
    addNetwork: function() {
        var id = parseInt(this.$el.find("select.networks").val());
        if (!_.isNaN(id)) {
            var networkIds = this.model.get("networkIds") || [];
            if (id != null && _.indexOf(networkIds, id) == -1) {
                networkIds.push(id);
                this.model.set("networkIds", networkIds);
                this.change();
            }
        }
    },
    addDevice: function() {
        var id = this.$el.find("select.devices").val();
        if (!_.isEmpty(id)) {
            var deviceGuids = this.model.get("deviceGuids") || [];
            if (id != null && _.indexOf(deviceGuids, id) == -1) {
                deviceGuids.push(id);
                this.model.set("deviceGuids", deviceGuids);
                this.change();
            }
        }
    },
    removeNetwork: function(el) {
        var id = $(el.target).closest("li").data("id");
        var networkIds = this.model.get("networkIds");
        var index = _.indexOf(networkIds, id);
        if (index != -1) {
            networkIds.splice(index, 1);
            if (_.isEmpty(networkIds))
                this.model.set("networkIds", null);
            this.change();
        }
    },
    removeDevice: function(el) {
        var id = $(el.target).closest("li").data("id")
        var deviceGuids = this.model.get("deviceGuids");
        var index = _.indexOf(deviceGuids, id);
        if (index != -1) {
            deviceGuids.splice(index, 1);
            if (_.isEmpty(deviceGuids))
                this.model.set("deviceGuids", null);
            this.change();
        }
    },
    change: function() {
        this.model.trigger("change", this.model);
    }
});

// model is AccessKey
app.Views.AccessKey = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .save": "saveAccessKey",
        "click .add-access-key-permission": "addPermission"
    },
    triggers: {
        "click .cancel": "cancel"
    },
    template: "access-key-template",
    className: "panel",
    itemView: app.Views.AccessKeyPermissionEditListItem,
    itemViewContainer: ".access-key-permissions-edit-table tbody",
    initialize: function(options) {
        this.originalModel = this.model;
        this.model = this.model.clone();
        this.networks = options.networks;
        this.devices = options.devices;
        this.collection = this.model.get("permissions");
        this.on("itemview:removePermission", this.removePermission);
    },
    itemViewOptions: function() {
        return {
            networks: _.reduce(this.networks.toJSON(), function(obj, network) { obj[network.id] = network; return obj; }, {}),
            devices: _.reduce(this.devices.toJSON(), function(obj, device) { obj[device.id] = device; return obj; }, {})
        };
    },
    saveAccessKey: function() {
        //app.vent.trigger("notification", app.Enums.NotificationType.Error, "hello :)");
    },
    addPermission: function() {
        this.model.get("permissions").add({ domains: null, subnets: null, actions: null, networkIds: null, deviceGuids: null });
    },
    removePermission: function(viewItem) {
        this.model.get("permissions").remove(viewItem.model);
    }

});
