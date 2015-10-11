//model is an app.Models.Device
app.Views.DevicePanels = Backbone.Marionette.ItemView.extend({
    events: {
        //"click .equipment-tab": "showEquipment",
        "click .notifications-tab": "showNotifications",
        "click .commands-tab": "showCommands"
    },
    initialize: function (options) {
        //this.deviceEquipmentsView = null;
        this.notificationsView = null;
        this.commandsView = null;
        this.commandsTimeFilters = new app.Models.TimeFilters();
        this.notificationsTimeFilters = new app.Models.TimeFilters();

        this.initialState = options.state;
    },
    setState: function (state) {
        if (state != "notifications" && state != "commands" && state != "equipment")
            state = "commands";

        var prevState = this.state;
        //state wasn't changed. Do nothing
        if (prevState == state)
            return;

        this.state = state;

        //if setState called after initial rendering
        if (this.$el)
            this.markTab();

        this.renderCurrentPanel();

        if (!_.isUndefined(prevState))
            this.trigger("onChangeMode", this.state);
    },
    renderCurrentPanel: function () {
        var that = this;

        switch (this.state) {
            //case "equipment":
            //
            //    //close other panels and render equipments.
            //    if (that.notificationsView != null) {
            //        that.notificationsView.close();
            //        delete that.notificationsView;
            //    };
            //    if (that.commandsView != null) {
            //        that.commandsView.close();
            //        delete that.commandsView;
            //    };
            //    if (that.deviceEquipmentsView == null) {
            //        that.deviceEquipmentsView = new app.Views.DeviceEquipments({ model: that.model });
            //    }
            //
            //    var smth = that.deviceEquipmentsView.renderModel();
            //    that.deviceEquipmentsView.$el.html(smth);
            //    that.$el.append(that.deviceEquipmentsView.$el);
            //    that.deviceEquipmentsView.collection.fetch();
            //    break;
            case "commands":

                //close other panels and render commands.
                if (that.notificationsView != null) {
                    that.notificationsView.close();
                    delete that.notificationsView;
                };
                //if (that.deviceEquipmentsView != null) {
                //    that.deviceEquipmentsView.close();
                //    delete that.deviceEquipmentsView;
                //};
                if (that.commandsView == null) 
                    that.commandsView = new app.Views.Commands({ model: that.model, timeFilters: that.commandsTimeFilters });
                
                smth = that.commandsView.renderModel();
                that.commandsView.$el.html(smth);
                that.$el.append(that.commandsView.$el);
                that.commandsView.refreshCollection();
                break;
            case "notifications":

                //close other panels and render notifications.
                if (that.deviceEquipmentsView != null) {
                    that.deviceEquipmentsView.close();
                    delete that.deviceEquipmentsView;
                };
                if (that.commandsView != null) {
                    that.commandsView.close();
                    delete that.commandsView;
                };

                if (that.notificationsView == null) 
                    that.notificationsView = new app.Views.Notifications({ model: that.model, timeFilters: that.notificationsTimeFilters });
                
                smth = that.notificationsView.renderModel();
                that.notificationsView.$el.html(smth);
                that.$el.append(that.notificationsView.$el);
                that.notificationsView.refreshCollection();
                break;
        }
    },
    onClose: function () {
        //if (this.deviceEquipmentsView != null) {
        //    this.deviceEquipmentsView.close();
        //    delete this.deviceEquipmentsView;
        //};
        if (this.commandsView != null) {
            this.commandsView.close();
            delete this.commandsView;
        };
        if (this.notificationsView != null) {
            this.notificationsView.close();
            delete this.notificationsView;
        };
    },
    onRender: function (options) {
        this.$el.addClass("device-panels");
        this.setState(this.initialState);
    },
    markTab: function () {
        var tabClassName = "." + this.state + "-tab";

        this.$el.find(".menu-item").removeClass("selected");
        this.$el.find(tabClassName).addClass("selected");
    },
    template: "device-panels-template",
    //showEquipment: function () {
    //    this.setState("equipment");
    //},
    showNotifications: function () {
        this.setState("notifications");
    },
    showCommands: function () {
        this.setState("commands");
    }
});