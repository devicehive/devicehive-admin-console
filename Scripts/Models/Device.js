app.Models.Device = Backbone.Model.extend({
    urlRoot: function () {
         return app.restEndpoint + "/device";
     },
     setStrData: function (value) {
         try {
             this.set("data", jQuery.parseJSON(value));
             return true;
         } catch (e) {
             app.vent.trigger("notification", app.Enums.NotificationType.Error, "Valid javascript object should be entered");
             return false;
         }
     }
});

app.Models.DevicesCollection = Backbone.Collection.extend({
    url: function () {
         return app.restEndpoint + "/device";
    },
    model: app.Models.Device,
    comparator: function (device) {
        var name = device.get("name");
        if (device)
            return name.toLowerCase();
        else
            return 1000000;
    }
});
