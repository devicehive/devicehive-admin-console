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
//model is an app.Models.Command
app.Views.CommandListItem = Backbone.Marionette.ItemView.extend({
    events: {
        "click .refresh": "refreshAction",
        "click .push": "pushAction",
        "click .close-form": "closeAction",
        "click .copy": "copyAction"
    },
    initialize: function () {
        this.bindTo(this.model, "change", function () {
            this.render();
        }, this);
    },
    template: "command-list-item-template",
    tagName: "tr",
    onRender: function () {
        if (this.model.isNew())
            this.showEditableFields();
        else
            this.showInfoFields();
    },
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });

        //add backslashes to &quot; entity created during escaping  
		if (_.has(data, "result") && !_.isNull(data.result))
            data["result"] = JSON.stringify(data.result).replace(/&quot;/g,"\\&quot;");
        else
            data["result"] = "";

		
        if (!_.has(data, "status") || _.isNull(data.status))
            data.status = "";
		//add backslashes to &quot; entity created during escaping   
        if (_.has(data, "parameters") && !_.isNull(data.parameters))
            data["parameters"] = JSON.stringify(data.parameters).replace(/&quot;/g,"\\&quot;");
        else
            data["parameters"] = "";

        if (_.has(data, "timestamp") && !_.isEmpty(data.timestamp))
            data["timestamp"] = app.f.parseUTCstring(data.timestamp).format("mm/dd/yyyy HH:MM:ss");
        else
            data["timestamp"] = "";

        if (!_.has(data, "command") || _.isNull(data.command))
            data["command"] = "";

        return data;
    },
    showEditableFields: function () {
        this.$el.find(".editable-zone, .push, .close-form").show();

        this.$el.find(".data-zone").hide();
        this.$el.find(".refresh").hide();
        this.$el.find(".copy").hide();
    },
    showInfoFields: function () {
        this.$el.find(".editable-zone, .push, .close-form").hide();
        this.$el.find(".data-zone").show();

        if (!(_.isEmpty(this.model.get("status")))) {
            this.$el.find(".refresh").hide();
            this.$el.find(".copy").show();
        }
        else {
            this.$el.find(".refresh").show();
        }
    },
    closeAction: function () {
        if (this.model.isNew())
            this.model.destroy();
    },
    refreshAction: function () {
        this.model.fetch({
            error: function (mod, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            }
        });
    },
    copyAction: function () {
        this.model.collection.add(this.model.copyIt());
    },
    pushAction: function () {
        var fields = {};
        var name = this.$el.find(".new-command-name").val();

        var parameters = this.$el.find(".new-command-params").val();


        var that = this;

        if (this.model.setStrParameters(parameters)) {
            this.model.save({command: name }, {
                error: function (mod, response) {
                    that.model.collection.remove(that.model);
                    app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
                },
                success: function () {
                    that.model.collection.remove(that.model);
                    app.vent.trigger("notification", app.Enums.NotificationType.Notify, "Command " + name + " has been succesfully send to device " + that.model.device.get("id"));
                }
            });
        }
    }
});

//collection is an app.Models.CommandsCollection
app.Views.Commands = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .add-command": "addCommand",
        "click .show-datetime-filter": "showDateTimeFilter"
    },
    itemView: app.Views.CommandListItem,
    template: "commands-list-template",
    emptyView: Backbone.Marionette.ItemView.extend({ template: "commands-empty-template", tagName: "tr" }),
    initialize: function (options) {
        this.collection = new app.Models.CommandsCollection({}, { device: this.model });

        if (!_.isUndefined(options) && _.has(options, "timeFilters"))
            this.timeFiltersModel = options.timeFilters;
        else
            this.timeFiltersModel = new app.Models.TimeFilters();
        
        this.bindTo(this, "composite:collection:rendered", this.StopLoading, this);
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
        this.$el.append(that.timeFiltersView.$el);

        this.timeFiltersView.on("applyFilters", function () {
            that.applyDateTimeFilter();
        });
        this.timeFiltersView.on("closeFilters", function () {
            that.timeFiltersView.$el.hide();
        });
    },
    onClose: function () {
        this.collection.closePolling();
    },
    appendHtml: function (collectionView, itemView, index) {
        if (!("$_itemViewContainer" in collectionView))
            collectionView.$_itemViewContainer = collectionView.$el.find(".child-items-holder");

        collectionView.$_itemViewContainer.prepend(itemView.el);
    },
    refreshCollection: function () {
        this.collection.closePolling();

        var that = this;
        var params = {};

        var start = this.timeFiltersModel.get("startDateUTCString");
        var end = this.timeFiltersModel.get("endDateUTCString");

        if (!_.isEmpty(start))
            params["start"] = app.f.parseISOLocal(start).toUTCString();
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
    addCommand: function () {
        this.collection.add(new app.Models.Command({}, { device: this.model }));
    },
    showDateTimeFilter: function () {
        var dtBox = this.timeFiltersView.$el;
        var pos = this.$el.find(".show-datetime-filter").offset();

        dtBox.css("top", pos.top - 20);
        dtBox.css("left", pos.left);
        dtBox.show();
    },
    applyDateTimeFilter: function () {
        this.timeFiltersView.$el.hide();
        this.refreshCollection();
    }
});

