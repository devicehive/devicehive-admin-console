app.Models.Notification = Backbone.AuthModel.extend({
    defaults: {
        notification: ''
    },
    initialize: function (attributes, options) {
        if (!_.isUndefined(attributes) && _.has(attributes, "device")) {
            this.device = attributes.device;
        }
        else if (!_.isUndefined(options) && _.has(options, "device")) {
            this.device = options.device;
        } else if (!_.isUndefined(this.collection) && _.has(this.collection, "device")) {
            this.device = this.collection.device;
        } else {
            var err = new Error("Device should be specified to define notification endpoint");
            err.name = "Notification without device error";
            throw err;
        }
    },
    urlRoot: function () {
        return app.restEndpoint + '/device/' + this.device.get("id") + "/notification";
    },
    copyIt: function () {
        var fields = {
            notification: this.get("notification"),
            parameters: this.get("parameters")
        };
        return new app.Models.Notification(fields, { device: this.device });
    },
});

app.Models.NotificationsCollection = Backbone.AuthCollection.extend({
    initialize: function (attributes, options) {
        if (!_.isUndefined(attributes) && _.has(attributes, "device")) {
            this.device = attributes.device;
        }
        else if (!_.isUndefined(options) && _.has(options, "device")) {
            this.device = options.device;
        } else {
            var err = new Error("Device should be specified to define notification endpoint");
            err.name = "Notification without device error";
            throw err;
        }
    },
    url: function () {
        return app.restEndpoint + '/device/' + this.device.get("id") + "/notification?take=100&sortOrder=DESC";
    },
    parse: function (resp, xhr) {
        // reverse items order back to ascending
        return resp.reverse();
    },
    closePolling: function () {
        if (!_.isEmpty(this.jqXhr)) {
            this.deleted = true;
            this.jqXhr.abort("user initiated abort");
        }
    },
    pollUpdates: function () {
        var pollUrl = app.restEndpoint + "/device/" + this.device.get("id") + "/notification/poll";
        var that = this;
        this.deleted = false;

        var timestamp = app.f.getMaxTimeMicro(this.pluck("timestamp"));

        that.jqXhr = $.ajax({
            url: pollUrl,
            dataType: "json",
            headers: Backbone.AuthModel.prototype.authHeader(),
            data: {timestamp:timestamp},
            success: function (data) {
                _.each(data, function (incomingNotification) {
                    that.add(new app.Models.Notification(incomingNotification, { device: that.device }));
                });
            },
            complete: function () {
                if (that.deleted == false)
                    that.pollUpdates();
            },
            timeout: 30000
        });
    },
    model: app.Models.Notification
});
