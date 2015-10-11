// model is AccessKeyPermission
app.Views.AccessKeyPermissionEditListItem = Backbone.Marionette.ItemView.extend({
    events: {
        "click .remove-network": "removeNetwork",
        "click .remove-device": "removeDevice",
        "click .add-device": "addDevice",
        "click .add-network": "addNetwork",
        "change .subnets": "changeSubnets",
        "keyup .subnets": "changeSubnets",
        "change .domains": "changeDomains",
        "keyup .domains": "changeDomains",
        "change .action": "changeActions"
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
        this.prepareViewModel();
    },
    prepareViewModel: function() {
        this.domainsText = (this.model.get("domains") || []).join("\n");
        this.subnetsText = (this.model.get("subnets") || []).join("\n");
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
        data.domainsText = this.domainsText;
        data.subnetsText = this.subnetsText;
        data.availableActions = app.Models.AccessKeyPermission.actions;
        data.adminActions = app.Models.AccessKeyPermission.adminActions;
        return data;
    },
    addNetwork: function() {
        var id = parseInt(this.$el.find("select.networks").val());
        if (!_.isNaN(id)) {
            var networkIds = this.model.get("networkIds") || [];
            if (id != null && _.indexOf(networkIds, id) == -1) {
                networkIds.push(id);
                this.model.set("networkIds", networkIds, { silent: true });
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
                this.model.set("deviceGuids", deviceGuids, { silent: true });
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
                this.model.set("networkIds", null, { silent: true });
            this.change("networkIds");
        }
    },
    removeDevice: function(el) {
        var id = $(el.target).closest("li").data("id");
        var deviceGuids = this.model.get("deviceGuids");
        var index = _.indexOf(deviceGuids, id);
        if (index != -1) {
            deviceGuids.splice(index, 1);
            if (_.isEmpty(deviceGuids))
                this.model.set("deviceGuids", null, { silent: true });
            this.change("deviceGuids");
        }
    },
    changeDomains: function() {
        this.domainsText = this.$el.find("textarea.domains").val();
        var domainsList = _.without(this.domainsText.split("\n").map(function(domain) { return $.trim(domain); }), "");
        domainsList = _.isEmpty(domainsList) ? null : domainsList;
        this.model.set("domains", domainsList, { silent: true });
    },
    changeSubnets: function() {
        this.subnetsText = this.$el.find("textarea.subnets").val();
        var subnetsList = _.without(this.subnetsText.split("\n").map(function(subnet) { return $.trim(subnet); }), "");
        subnetsList = _.isEmpty(subnetsList) ? null : subnetsList;
        this.model.set("subnets", subnetsList, { silent: true });
    },
    changeActions: function() {
        var actions = this.$el.find(".action:checked").map(function(cb) { return $(this).val(); }).toArray();
        if (_.isEmpty(actions)) {
            actions = null;
        }
        this.model.set("actions", actions, { silent: true });
    },
    change: function(attr) {
        if (attr && !_.isEmpty(attr))
            this.model.trigger("change:" + attr, this.model);
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
        this.user = options.user;
        this.on("itemview:removePermission", this.removePermission);
    },
    itemViewOptions: function() {
        var networks;
        var devices;
        if (!this.user || this.user.get("role") == app.Enums.UserRole.Administrator) {
            networks = this.networks.toJSON();
            devices = this.devices.toJSON();
        }
        else {
            if (this.user.get("networks") != null && this.user.get("networks").length) {
                networks = _.map(this.user.get("networks"), function(network) { return network.network; });
                var userNetworkIds = _.map(networks, function(network) { return network.id } );
                devices = _.filter(
                    this.devices.toJSON(), function(device) { return device.network && _.indexOf(userNetworkIds, device.network.id) != -1 });
            }
        }

        return {
            networks: _.reduce(networks || [], function(obj, network) { obj[network.id] = network; return obj; }, {}),
            devices:  _.reduce(devices || [], function(obj, device) { obj[device.id] = device; return obj; }, {})
        };
    },
    onRender: function() {
        this.$el.find(".expiration-date").datetimepicker();
    },
    saveAccessKey: function() {
        var validationErrors = _.reduce(this.children, function(errors, child) {
            var result = child.model.validate();
            if (!_.isUndefined(result))
                errors.push(result);
            return errors;
        }, []);

        if (validationErrors.length) {
            app.vent.trigger("notification", app.Enums.NotificationType.Error, validationErrors.join("\n"));
        }
        else {
            var expirationDate = null;
            var expirationDateEl = this.$el.find(".expiration-date");
            if (!_.isEmpty($.trim(expirationDateEl.val()))) {
                expirationDate = app.f.toISOString(expirationDateEl.datetimepicker("getDate"));
            }

            var label = this.$el.find(".label").val();
            if (_.isEmpty(label)) {
                label = null;
            }
            var type = $('#accessKeyType').find(':selected').val();
            if (_.isEmpty(type)) {
                type = null;
            }
            var changes = {
                label: label,
                expirationDate: expirationDate,
                type: type
            };

            var that = this;
            this.originalModel.get("permissions").reset(this.model.get("permissions").toJSON(), { silent: true });
            this.originalModel.save(changes, {
                success: function (model, response) {
                    that.trigger("success", model);
                    model.trigger("change", model);
                },
                error: function (model, response) {
                    app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
                },
                wait: true
            });
        }
    },
    addPermission: function() {
        this.model.get("permissions").add({ domains: null, subnets: null, actions: null, networkIds: null, deviceGuids: null });
    },
    removePermission: function(viewItem) {
        this.model.get("permissions").remove(viewItem.model);
    },
    updateModel: function() {
        var expDate = null;
        if (!_.isEmpty(this.$el.find(".expiration-date").val()))
            expDate = this.$el.find(".expiration-date").datetimepicker("getDate");
        this.model.set("expirationDate", expDate);
    },
    serializeData: function() {
        var data = this.model.toJSON({ escape: true });
        if (!_.has(data, "label"))
            data["label"] = "";
        if (_.has(data, "expirationDate") && !_.isEmpty(data["expirationDate"]))
            data["expirationDate"] = app.f.parseUTCstring(data["expirationDate"]).format("mm/dd/yyyy HH:MM");
        else
            data["expirationDate"] = "";
        if (!_.has(data, "type"))
            data.type = app.Enums.AccessKeyType.Default;
        data.types = app.Enums.AccessKeyType;
        return data;
    }

});
