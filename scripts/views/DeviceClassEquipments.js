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
//push app.Models.DeviceClass here
app.Views.DeviceClassEquipments = Backbone.Marionette.CompositeView.extend({
    triggers: {
        "click .close-equipments": "closeEquipments"
    },
    events: {
        "click .add-equipment": "addEquipment"
    },
    beforeRender: function () {
        this.$el.addClass("device-classes-edit panel");
    },
    onRender: function () {
        if (this.model.get("isPermanent") == true)
            this.$el.find(".add-equipment").hide();
    },
    template: "device-class-equipments-template",
    itemView: app.Views.EquipmentListItem,
    itemViewContainer: ".equipment-table-body",
    initialize: function () {
        //if no model specified - create new model.
        this.model.bind("change", function () { this.render(); }, this);
    },
    addEquipment: function () {
        if (this.model.get("isPermanent") == false)
            this.collection.add(new app.Models.Equipment({}, { deviceClass: this.model }));
    }
});

