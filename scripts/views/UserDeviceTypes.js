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
//model is a Backbone.Collection (??? or app.Models.DeviceType)
app.Views.UserDeviceTypeListItem = Backbone.Marionette.ItemView.extend({
    triggers: {
        "click .reject": "reject"
    },
    template: "user-device-type-list-item",
    tagName: "tr"
});

//model is an app.Model.User
app.Views.UserDeviceTypes = Backbone.Marionette.CompositeView.extend({
    triggers: {
        "click .back": "backClicked"
    },
    initialize: function () {
        this.collection = this.model.get("deviceTypesCollection");
        this.bindTo(this, "itemview:reject", this.rejectChild);
    },
    rejectChild: function (childView) {
        this.model.removeDeviceType(childView.model.get("id"));
    },
    onRender: function () {
        this.$el.find(".add").toggle(app.hasRole(app.Enums.UserRole.Administrator));

        //New User Device Types page hints
        if (app.User && (!(localStorage.introReviewed) || (localStorage.introReviewed === 'false'))) {
            var enjoyhint_instance = new EnjoyHint({});
            var enjoyhint_devices_script_steps = [];
            if (app.hasRole(app.Enums.UserRole.Administrator)) {
                enjoyhint_devices_script_steps = app.hints.userDeviceTypesHintsAdmin;
                enjoyhint_instance.set(enjoyhint_devices_script_steps);
                enjoyhint_instance.run();
                $(".enjoyhint_skip_btn").on("click", function() {
                    app.disableNewUserHints();
                });
            }
        }
    },
    itemView: app.Views.UserDeviceTypeListItem,
    emptyView: Backbone.Marionette.ItemView.extend({template:"user-device-types-empty-template",tagName:"tr"}),
    template: "user-device-types-template",
    itemViewContainer: "tbody"
});

