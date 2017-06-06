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
app.Views.NetworkListItem = Backbone.Marionette.ItemView.extend({
    events: {
        "click .delete": "deleteNetwork",
        "click .edit": "editNetwork",
        "click .save": "saveNetwork",
        "click .cancel": "cancelAction"
    },
    initialize: function () {
        this.bindTo(this.model,"change", function () {
            this.model.collection.sort();
        }, this);
    },
    template: "network-list-item-template",
    tagName: "tr",
    onRender: function () {
        if (app.hasRole(app.Enums.UserRole.Administrator)) {
            if (this.model.isNew())
                this.showEditableAreas();
            else
                this.showValuesAreas();
        }
        else {
            this.showValuesAreas(false);
        }
    },
    deleteNetwork: function () {
        var that = this;
        if (confirm("Do you really want to delete this network? All associations with users will be lost")) {
            this.model.destroy(
                {
                    success: function() {
                        //reloading page to fetch new model
                        location.reload();
                    },
                    error: function (model, response) {
                        that.render();
                        app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
                    },
                    wait: true
                });
        }
    },
    saveNetwork: function () {
        var name = this.$el.find("#new-network-name").val();
        var desc = this.$el.find("#new-network-description").val();

        if(!name) {
            this.$el.find('.new-network-name').tooltip();
            this.$el.find('.new-network-name').focus();
            return;
        }

        var that = this;
        this.model.save({ name: name, description: desc}, {
            success: function () {
                that.render();
            }, error: function (model, response) {
                that.render();
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            wait: true
        });

    },
    cancelAction: function () {
        if (this.model.isNew())
            this.model.destroy();
        else
            this.render();
    },
    editNetwork: function () {
        this.showEditableAreas();
    },
    showValuesAreas: function (canEdit) {
        this.$el.find(".current-value").show();
        this.$el.find(".new-value").hide();
        this.$el.find(".buttons-column>span.current-value").toggle(_.isUndefined(canEdit) || canEdit);
    },
    showEditableAreas: function () {
        this.$el.find(".new-value").show();
        this.$el.find(".current-value").hide();
    },
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });
        if (!_.has(data, "name"))
            data["name"] = "";
        if (!_.has(data, "description"))
            data["description"] = "";

        return data;
    }
});

//collection is an app.Models.NetworksCollection
app.Views.Networks = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .add": "addNetwork"
    },
    itemView: app.Views.NetworkListItem,
    emptyView: Backbone.Marionette.ItemView.extend(
        {
            render: function () {
                var text = app.hasRole(app.Enums.UserRole.Administrator)
                    ? "No networks available. Create first one!"
                    : "No networks available";
                this.$el.html("<td colspan='4'>" + text + "</td>");
                return this;
            },
            tagName: "tr"
        }),
    template: "networks-template",
    itemViewContainer: "tbody",
    addNetwork: function () {
        this.collection.add(new app.Models.Network());
    },
    onRender: function () {
        this.$el.find(".add").toggle(app.hasRole(app.Enums.UserRole.Administrator));

        //New User Networks page hints
        if (app.User && (!(localStorage.introReviewed) || (localStorage.introReviewed === 'false'))) {
            var enjoyhint_instance = new EnjoyHint({});
            var enjoyhint_devices_script_steps = [];
            if (app.hasRole(app.Enums.UserRole.Administrator)) {
                enjoyhint_devices_script_steps = app.hints.networksHintsAdmin;
            } else {
                enjoyhint_devices_script_steps = app.hints.networksHintsClient;
            }
            enjoyhint_instance.set(enjoyhint_devices_script_steps);
            enjoyhint_instance.run();
            $(".enjoyhint_skip_btn").on("click", function() {
                app.disableNewUserHints();
            });
        }
    }
});

