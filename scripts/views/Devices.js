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
app.Views.DeviceListItem = Backbone.Marionette.ItemView.extend({
    triggers: {
        "click .detail": "showDetail"
    },
    events: {
        "click .edit": "editDevice",
        "click .delete": "deleteDevice",
        "click .save": "saveDevice",
        "click .cancel": "cancelAction"
    },
    initialize: function (options) {
        this.bindTo(this.model,"change", function () {
            this.render();
        }, this);

        this.networksList = options.networks;
        this.classesList = options.classes;
        this.classEditable = options.classEditable;
    },
    template: "device-list-item-template",
    tagName: "tr",
    onRender: function () {
        if (app.hasRole(app.Enums.UserRole.Administrator)) {
            if (this.model.isNew())
                this.showEditableAreas();
            else
                this.showValuesAreas();
        }
        else {
            if (this.model.isNew())
                this.showEditableAreas();
            else
                this.showValuesAreas();
        }
    },
    deleteDevice: function () {
        if (confirm("Do you really want to delete this device? All collected information will be lost."))
            this.model.destroy({ error: function (model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            }
            });
    },
    saveDevice: function () {
        var name = this.$el.find(".new-device-name").val();
        var data = this.$el.find(".new-device-data").val();
        var netwId = this.$el.find(".new-device-network :selected").val();
        var status = this.$el.find(".new-device-status").val();
        var isBlocked = this.$el.find(".new-isBlocked-state").val();

        if((data.length > 0) && !app.isJson(data)) {
            this.$el.find('.new-device-data').tooltip();
            this.$el.find('.new-device-data').focus();
            return;
        }

        if(!name) {
            this.$el.find('.new-device-name').tooltip();
            this.$el.find('.new-device-name').focus();
            return;
        }

        if (!netwId  || netwId == 0) {
            return;
        } else {
            var network = this.networksList.find(function (net) { return net.id == netwId; }).toJSON({ escape: true });
        }

        var changes = {
            name: name,
            data: (data.length > 0) ? JSON.parse(data) : null,
            status: status,
            networkId: netwId,
            network: network,
            isBlocked: isBlocked
        };

        var that = this;
        if (this.model.isNew()) {
            //Generate random device ID
            this.model.set({id: this.makeid()});
        }
        this.model.save(changes, {
            type: 'PUT',
            success: function () {
                that.render();
            }, error: function (model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            wait: true
        });

    },
    makeid: function() {
        //Generating random ID for new device
        var newId = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 36; i++ ) {
            newId += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return newId;
    },
    cancelAction: function () {
        if (this.model.isNew())
            this.model.destroy();
        else
            this.render();
    },
    editDevice: function () {
        this.showEditableAreas();
    },
    showValuesAreas: function () {
        this.$el.find(".current-value").show();
        this.$el.find(".new-value").hide();
    },
    showEditableAreas: function () {
        this.$el.find(".new-value").show();
        this.$el.find(".current-value").hide();
    },
    serializeData: function () {
        var base = this.model.toJSON({ escape: true });

        if (_.has(base, "data") && !_.isNull(base.data)) {
            base["data"] = JSON.stringify(base.data);
        } else  {
            base["data"] = "";
        }

        if (base.networkId == null) {
            base["network"] = { id: 0, name: "" };
        } else {
            base["network"] = this.networksList.find(function (net) {return net.id == base.networkId;}).toJSON({escape: true});
        }

        if (base["isBlocked"] && (base["isBlocked"].length > 0)) {
            base["isBlocked"] = (base["isBlocked"] == "false") ? false : true;
        }

        base.networks = [];
        base.networks = base.networks.concat(this.networksList.toJSON({ escape: true }));

        base.classEditable = this.classEditable;
        base.classes = base.classEditable ? this.classesList.toJSON({ escape: true }) : [];

        return base;
    }
});

//collection is an app.Models.NetworksCollection
app.Views.Devices = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .add": "addDevice"
    },
    itemView: app.Views.DeviceListItem,
    itemViewOptions: function () {
        return {
            networks: this.networks,
            classes: this.classes,
            classEditable: this.classEditable
        };
    },
    emptyView: Backbone.Marionette.ItemView.extend(
        {
            render: function () {
                this.$el.html("<td colspan='5'>No devices available</td>");
                return this;
            },
            tagName: "tr"
        }),
    template: "devices-template",
    itemViewContainer: "tbody",
    initialize: function (options) {
        this.userData = app.parseJwt(localStorage.deviceHiveToken);
        this.networks = options.networks;
        this.classes = options.classes;
        this.classEditable = options.classEditable;
    },
    addDevice: function() {
        if(this.networks.length > 0) {
            this.collection.add(new app.Models.Device({"isBlocked": false}));
        } else {
            return;
        }
    },
    onRender: function() {
        var that = this;
        if(this.networks.length > 0) {
            this.$el.find(".add-device").prop('disabled', false);
        } else {
            this.$el.find(".add-device").addClass("disabled").attr("rel", "tooltip");
            this.$el.find('[data-toggle="tooltip"]').tooltip();
        }

        //New User Devices page hints
        setTimeout(function () {
            if (app.User && (!(localStorage.introReviewed) || (localStorage.introReviewed === 'false'))) {
                var enjoyhint_instance = new EnjoyHint({});
                var enjoyhint_devices_script_steps = []

                if (app.hasRole(app.Enums.UserRole.Administrator)) {
                    if (!(that.collection.length > 0)) {
                        enjoyhint_devices_script_steps = app.hints.devicesHintsAdminWithNoDevices;
                    } else {
                        enjoyhint_devices_script_steps = app.hints.devicesHintsAdmin;
                    }

                } else {
                    if (!(that.collection.length > 0)) {
                        if (that.networks.length > 0) {
                            enjoyhint_devices_script_steps = app.hints.devicesHintsWithNetwork;
                        } else {
                            enjoyhint_devices_script_steps = app.hints.devicesHintsClientWithNoNetworks;
                        }
                    } else {
                        enjoyhint_devices_script_steps = app.hints.devicesHintsWithDevice;
                    }
                }

                enjoyhint_instance.set(enjoyhint_devices_script_steps);
                enjoyhint_instance.run();

                $(".enjoyhint_skip_btn").on("click", function() {
                    app.disableNewUserHints();
                });
            }
        }, 1000);

    }
});

