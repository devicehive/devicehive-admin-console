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
//should use app.Models.DeviceType
app.Views.DeviceTypeOption = Backbone.Marionette.ItemView.extend({
    tagName: "option",
    template: "empty",
    onRender: function () {
        if (this.model.attributes.name && (this.model.attributes.name.length > 0)) {
            this.$el.attr("value", this.model.escape("id"));
            this.$el.html(this.model.escape("name"));
        } else  {
            this.$el.hide();
        }

    }
});

//model: app.Models.User
//collection: app.Models.DeviceTypesCollection
app.Views.AppendUserToDeviceType = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .accept": "append"
    },
    itemView: app.Views.DeviceTypeOption,
    template: "user-device-types-append-template",
    itemViewContainer: "#registered-device-types",
    append: function () {
        var netValue = this.$el.find("#registered-device-types :selected").val();
        var found = this.collection.find(function (curColl) {
            return curColl.get("id") == netValue;
        });

        if (found != null)
            this.model.addDeviceType(found);
    }
});

