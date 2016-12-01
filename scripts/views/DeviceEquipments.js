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
//model is an app.Models.Networks
app.Views.DeviceEquipmentListItem = Backbone.Marionette.ItemView.extend({
    initialize: function () {
        this.model.bind("change", function () {
            this.render();
        }, this);
    },
    template: "device-equipment-list-item-template",
    tagName: "tr",
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });

        if (_.has(data, "parameters"))
            data["parameters"] = JSON.stringify(data.parameters);
        else
            data["parameters"] = "";

        if (_.has(data, "timestamp"))
            data["refreshTime"] = app.f.parseUTCstring(data.timestamp).format("mm/dd/yyyy HH:MM:ss");
        else
            data["refreshTime"] = "never";

        return data;
    }
});

//collection is an app.Models.DeviceEquipmentsCollection
app.Views.DeviceEquipments = Backbone.Marionette.CompositeView.extend({
    itemView: app.Views.DeviceEquipmentListItem,
    template: "device-equipments-list-template",
    initialize: function () {
        var that = this;
        this.collection = new app.Models.DeviceEquipmentsCollection({ }, { device: this.model });
    },
    itemViewContainer: "tbody"
});

