/*
  DeviceHive Admin Console business logic

  Copyright (C) 2016 DataArt

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */
// model is AccessKeyPermission
app.Views.AccessKeyPermissionListItem = Backbone.Marionette.ItemView.extend({
    template: "access-key-permission-list-item-template",
    tagName: "tr",
    initialize: function(options) {
        this.networks = options.networks;
        this.devices = options.devices;
    },
    serializeData: function() {
        var data = this.model.toJSON({ escape: true });
        var initArray = function(obj, keys) {
            _.each(keys, function(item) { if (!_.has(obj, item)) { obj[item] = []; } });
        };
        initArray(data, ["domains", "subnets", "actions", "networkIds", "deviceGuids"]);
        data.adminActions = app.Models.AccessKeyPermission.adminActions;
        data.networks = this.networks;
        data.devices = this.devices;
        return data;
    }
});


//model is an app.Models.AccessKey
//collection is app.Models.AccessKeyPermissionsCollection
app.Views.AccessKeyListItem = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .details": "toggleDetails",
        "click .delete": "deleteAccessKey"
    },
    triggers: {
        "click .edit": "edit"
    },
    itemView: app.Views.AccessKeyPermissionListItem,
    itemViewContainer: "tbody",
    template: "access-key-list-item-template",
    tagName: "tbody",
    emptyView: Backbone.Marionette.ItemView.extend(
        {
            render: function() {
                this.$el.html("<td colspan='5'>No permissions set</td>");
                return this;
            },
            tagName: "tr"
        }),
    itemViewOptions: function() {
        return {
            networks: _.reduce(this.networks.toJSON(), function(obj, network) { obj[network.id] = network; return obj; }, {}),
            devices: _.reduce(this.devices.toJSON(), function(obj, device) { obj[device.id] = device; return obj; }, {})
        }
    },
    initialize: function(options) {
        this.collection = this.model.get("permissions");
        this.networks = options.networks;
        this.devices = options.devices;
        if (_.isUndefined(this.model.detailsVisible))
            this.model.detailsVisible = false;
        this.bindTo(this.model, "change", this.render);
        this.bindTo(this.model, "destroy", function(model) {
            this.trigger("deleted", model.id);
        });
    },
    onRender: function() {
        this.toggleDetails(null, this.model.detailsVisible)
    },
    toggleDetails: function(event, visible) {
        this.model.detailsVisible = !_.isUndefined(visible) ? visible : !this.model.detailsVisible;
        this.$el.find(".details-row").toggle(this.model.detailsVisible);
    },
    deleteAccessKey: function () {
        if (confirm("Do you really want to delete this access key?"))
            this.model.destroy({ error: function (model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            }
            });
    },
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });

        if (!_.has(data, "label"))
            data["label"] = "";
        if (!_.has(data, "key"))
            data["key"] = "";

        if (_.has(data, "expirationDate") && !_.isEmpty(data["expirationDate"]))
            data["expirationDate"] = app.f.parseUTCstring(data["expirationDate"]).format("mm/dd/yyyy HH:MM:ss");
        else
            data["expirationDate"] = "";
        data.type = app.Enums.AccessKeyType.getName(data.type);
        //data.types = app.Enums.AccessKeyType;

        return data;
    }
});


//collection is an app.Models.AccessKeysCollection
app.Views.AccessKeys = Backbone.Marionette.CompositeView.extend({
    triggers: {
        "click .add": "addClicked",
        "click .back": "backClicked"
    },
    itemView: app.Views.AccessKeyListItem,
    emptyView: Backbone.Marionette.ItemView.extend(
        {
            render: function () {
                this.$el.html("<td colspan='4'>there are no access keys yet. Create first one!</td>");
                return this;
            },
            tagName: "tr"
        }),
    template: "access-keys-template",
    itemViewContainer: "table",
    initialize: function (options) {
        this.networks = options.networks;
        this.devices = options.devices;
        this.user = options.user;
    },
    itemViewOptions: function() {
        return {
            networks: this.networks,
            devices: this.devices
        };
    },
    onRender: function() {
        this.$el.find(".user-data").toggle(!!this.user);
    },
    serializeData: function() {
        var data = { login: this.user && this.user.get("login") || "" };
        return data;
    }
});
