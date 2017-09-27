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

        if (_.has(base, "data") && !_.isNull(base.data)) {
            base["data"] = JSON.stringify(base.data);
        } else  {
            base["data"] = "";
        }

        if (base.networkId == null) {
            base["network"] = { id: 0, name: "---No network---" };
        } else {
            base["network"] = this.networksList.find(function (net) { return net.id == base.networkId; }).toJSON({escape: true});
        }


        base.networks = [];
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
        this.$el.find('#data-format-error').hide();

        this.$el.find(".device-value").show();
        this.$el.find(".edit-device").show();
    },

    saveDevice: function () {
        var data = this.$el.find(".new-value.data").val();
        var netwId = this.$el.find(".new-value.network").val();
        var network = (netwId == 0) ? null : this.networksList.find(function (net) { return net.id == netwId; }).toJSON({ escape: true });

        if((data.length > 0) && !app.isJson(data)) {
            this.$el.find('#data-format-error').show();
            return;
        } else {
            this.$el.find('#data-format-error').hide()
        }

        var changes = {
            name: this.$el.find(".new-value.name").val(),
            status: this.$el.find(".new-value.status").val(),
            network: network,
            networkId: netwId,
            data: (data.length > 0) ? JSON.parse(data) : null,
            isBlocked: this.$el.find('select.new-value[name=isBlocked]').val() == "1" ? true : false
        };

        var that = this;
        this.model.save(changes, {
            success: function () {
                that.render();
                app.DataCollections["DevicesCollection"] = null;
            }, error: function (model, response) {
                that.render();
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            wait: true
        });
    }
});




