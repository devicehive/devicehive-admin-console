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
//here is inner view for Users collection
app.Views.UserListItem = Backbone.Marionette.ItemView.extend({
    tagName: "tr",
    triggers: {
        "click .networks": "networksClicked",
        "click .edit": "editClicked",
        "click .delete": "deleteClicked"
    },
    template: "user-list-item-template",
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });
        if (_.has(data, "status"))
            data.status = app.Enums.UserStatus.getName(data.status);
        else
            data.status = "";
        if (_.has(data, "data") && !_.isNull(data.data))
            data["data"] = JSON.stringify(data.data);
        else
            data["data"] = "";

        if (_.has(data, "role"))
            data.role = app.Enums.UserRole.getName(data.role);
        else
            data.role = "";


        if (_.has(data, "lastLogin") && !_.isEmpty(data.lastLogin))
            data.lastLogin = app.f.parseUTCstring(data.lastLogin).format("mm/dd/yyyy HH:MM:ss");
        else
            data.lastLogin = "";

        if (!_.has(data, "googleLogin") || _.isEmpty(data.googleLogin))
            data.googleLogin = "";

        if (!_.has(data, "facebookLogin") || _.isEmpty(data.facebookLogin))
            data.facebookLogin = "";

        if (!_.has(data, "githubLogin") || _.isEmpty(data.githubLogin))
            data.githubLogin = "";

        return data;
    }
});

//push app.Models.UsersCollection here
app.Views.Users = Backbone.Marionette.CompositeView.extend({
    triggers: {
        "click .add": "addClicked"
    },
    initialize: function () {
        this.bindTo(this.collection, "change:selected", this.renderCollection);
    },
    beforeRender: function () {
        this.$el.addClass("users");
    },
    onRender: function () {
        //New User Users page hints
        if (app.User && (!(localStorage.introReviewed) || (localStorage.introReviewed === 'false'))) {
            var enjoyhint_instance = new EnjoyHint({});
            var enjoyhint_devices_script_steps = app.hints.usersHints;
            enjoyhint_instance.set(enjoyhint_devices_script_steps);
            enjoyhint_instance.run();

            $(".enjoyhint_skip_btn").on("click", function() {
                app.disableNewUserHints();
            });
        }
    },
    itemView: app.Views.UserListItem,
    itemViewContainer: "tbody",
    template: "user-list-template"
});