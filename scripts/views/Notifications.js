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
//model is an app.Models.Notification
app.Views.NotificationListItem = Backbone.Marionette.ItemView.extend({
    events: {
        "click .push": "pushAction",
        "click .close-form": "closeAction",
        "click .copy": "copyAction"
    },
    template: "notification-list-item-template",
    tagName: "tr",
    onRender: function() {
        if (this.model.isNew()) {
            this.showEditableFields();
        } else {
            this.showInfoFields();
        }
    },
    showEditableFields: function() {
        this.$el.find(".editable-zone, .push, .close-form").show();
        this.$el.find(".data-zone, .copy").hide();
    },
    showInfoFields: function() {
        this.$el.find(".editable-zone, .push, .close-form").hide();
        this.$el.find(".data-zone").show();
    },
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });

        if (_.has(data, "parameters") && !_.isNull(data.parameters)) {
            data["parameters"] = JSON.stringify(data.parameters);
        } else {
            data["parameters"] = "";
        }

        if (_.has(data, "timestamp") && !_.isEmpty(data.timestamp))
            data["timestamp"] = app.f.parseUTCstring(data.timestamp).format("mm/dd/yyyy HH:MM:ss");
        else
            data["timestamp"] = "";

        return data;
    },
    pushAction: function () {
        var fields = {};
        var name = this.$el.find(".new-notification-name").val();
        var parameters = this.$el.find(".new-notification-params").val();

        if ((name.indexOf("$device-update") !== -1) || (name.indexOf("$device-add") !== -1)) {
            this.$el.find('.new-notification-name').tooltip();
            this.$el.find('.new-notification-name').focus();
            return;
        }
        var that = this;
        if (app.Models.Command.prototype.setStrParameters.apply(this.model, [parameters])) {
            this.model.save({notification: name }, {
                error: function (mod, response) {
                    that.model.collection.remove(that.model);
                    app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
                },
                success: function () {
                    that.model.collection.remove(that.model);
                    app.vent.trigger("notification", app.Enums.NotificationType.Notify, "Notification " + name + " has been succesfully emulated from device " + that.model.device.get("id"));
                }
            });
        }
    },
    closeAction: function () {
        if (this.model.isNew())
            this.model.destroy();
    },
    copyAction: function () {
        this.model.collection.add(this.model.copyIt());
    }
});

//collection is an app.Models.NotificationsCollection
app.Views.Notifications = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .show-datetime-filter": "showDateTimeFilter",
        "click .add-notification": "addNotification"
    },
    itemView: app.Views.NotificationListItem,
    template: "notifications-list-template",
    emptyView: Backbone.Marionette.ItemView.extend({ template: "notifications-empty-template", tagName: "tr" }),
    initialize: function (options) {
        this.collection = new app.Models.NotificationsCollection({}, { device: this.model });
        if (!_.isUndefined(options) && _.has(options, "timeFilters"))
            this.timeFiltersModel = options.timeFilters;
        else
            this.timeFiltersModel = new app.Models.TimeFilters();

        this.bindTo(this, "composite:collection:rendered", this.StopLoading, this);
    },
    refreshCollection: function () {
        this.collection.closePolling();

        var that = this;
        var params = {};

        var start = this.timeFiltersModel.get("startDateUTCString");
        var end = this.timeFiltersModel.get("endDateUTCString");

        if (!_.isEmpty(start))
            params["start"] = app.f.parseISOLocal(start).toUTCString();;
        if (!_.isEmpty(end))
            params["end"] = app.f.parseISOLocal(end).toUTCString();

        this.StartLoading();
        this.collection.fetch({
            data: params,
            success: function () {
                if (_.isEmpty(end))
                    that.collection.pollUpdates();
            }
        });
    },
    StopLoading: function () {
        this.$el.find(".loading-area").hide();
    },
    StartLoading: function () {
        this.$el.find(".loading-area").show();
    },
    onRender: function () {
        this.timeFiltersView = new app.Views.TimeFilters({ model: this.timeFiltersModel });
        var that = this;

        this.timeFiltersView.render();
        that.$el.append(that.timeFiltersView.$el);

        this.timeFiltersView.on("applyFilters", function () {
            that.applyDateTimeFilter();
        });
        this.timeFiltersView.on("closeFilters", function () {
            that.timeFiltersView.$el.hide();
        });

        if (this.collection.length >= app.config.deviceNotificationsNum) {
            that.$el.find(".max-rows-number-reached").show();
        }
        
    },
    onClose: function () {
        this.collection.closePolling();
    },
    appendHtml: function (collectionView, itemView, index) {
        if (!("$_itemViewContainer" in collectionView))
            collectionView.$_itemViewContainer = collectionView.$el.find(".child-items-holder");

        collectionView.$_itemViewContainer.prepend(itemView.el);
    },
    showDateTimeFilter: function () {
        var dtBox = this.timeFiltersView.$el;
        var pos = this.$el.find(".show-datetime-filter").offset();

        dtBox.css("top", pos.top);
        dtBox.css("left", pos.left);
        dtBox.show();
    },
    addNotification: function () {
        var n = new app.Models.Notification({}, { device: this.model });
        this.collection.add(n);
    },
    applyDateTimeFilter: function () {
        this.timeFiltersView.$el.hide();
        this.refreshCollection();
    }
});

