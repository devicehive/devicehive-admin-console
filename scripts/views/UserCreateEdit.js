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
//push app.Models.User here
app.Views.UserCreateEdit = Backbone.Marionette.ItemView.extend({
    triggers: {
        "click .close-form" : "onCloseClick"
    },
    events: {
        "click .save": "save"
    },
    beforeRender: function () {
        this.$el.addClass("users-edit panel");
    },
    template: "user-create-edit-template",
    initialize: function () {
        if (_.isUndefined(this.model)) {
            this.model = new app.Models.User();
        }
    },
    save: function () {
        var login = this.$el.find("#login").val();
        var role = parseInt(this.$el.find("#role :selected").val());
        var status = parseInt(this.$el.find("#status :selected").val());
        var data = this.$el.find("#data").val();

        //Start user form validation
        var loginPatt = /^[a-zA-Z0-9\-._@]{3,128}$/;

        if(!login || (login.length < 3) ||  (login.length  > 128)) {
            this.$el.find('#login-length-error').show();
            return;
        } else if (!loginPatt.test(login)) {
            this.$el.find('#login-length-error').hide();
            this.$el.find('#login-pattern-error').show();
            return;
        } else {
            this.$el.find('#login-length-error').hide();
            this.$el.find('#login-pattern-error').hide();
        }


        var pass = this.$el.find("#password").val();
        var passConf = this.$el.find("#password-confirmation").val();

        if (this.model.isNew() && (!pass || pass.length < 6 || pass.length > 128)) {
            this.$el.find('#password-length-error').show();
            return;
        } else if(!this.model.isNew() && (pass && (pass.length < 6 || pass.length > 128))) {
            this.$el.find('#password-length-error').show();
            return;
        } else {
            this.$el.find('#password-length-error').hide();
        }

        if (pass !== passConf) {
            this.$el.find('#password-confirmation-match-error').show();
            return;
        } else {
            this.$el.find('#password-confirmation-match-error').hide();
        }

        if((data.length > 0) && !app.isJson(data)) {
            this.$el.find('#data-format-error').show();
            return;
        } else {
            this.$el.find('#data-format-error').hide()
        }
        //End user form validation
        var options = {
            login: login,
            role: role,
            status: status,
            password: pass,
            data: data
        };

        var that = this;
        this.model.save(options, { error: this.onSaveFail, success: function (model, response) { that.onSaveSuccess(model, response); }, wait:true });
    },
    onSaveSuccess: function (model, response) {
            this.trigger("onAfterUserSave", model);
    },

    onSaveFail: function (model, response) {
        app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
    },

    serializeData: function () {
        var base = this.model.toJSON({ escape: true });
        if (_.has(base, "data") && !_.isNull(base.data)) {
            var data = JSON.stringify(base.data);
            base["data"] = data.substring(1, data.length-1);
        } else {
            base["data"] = "";
        }
        base.Statuses = app.Enums.UserStatus;
        base.Roles = app.Enums.UserRole;
        base.saveButtonText = this.model.isNew() ? "create" : "save";
        base.HeadingText = this.model.isNew() ? "Creating new user" : "Editing user " + base.login;

        return base;
    },

    onRender: function() {
        this.$el.find('.password-info-icon').tooltip();
    },
    onShow: function() {
        // scroll to make edit form visible, focus on first input field
        this.$el[0].scrollIntoView(true);
        this.$el.find('input[type=text]').first().focus();
    }
});

