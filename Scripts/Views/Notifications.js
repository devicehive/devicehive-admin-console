//model is an app.Models.Notification
app.Views.NotificationListItem = Backbone.Marionette.ItemView.extend({
    template: "notification-list-item-template",
    tagName: "tr",
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });

        if (_.has(data, "parameters") && !_.isNull(data.parameters))
            data["parameters"] = JSON.stringify(data.parameters);
        else
            data["parameters"] = "";
            
        if (_.has(data, "timestamp") && !_.isEmpty(data.timestamp))
            data["timestamp"] = app.f.parseUTCstring(data.timestamp).format("mm/dd/yyyy HH:MM:ss");
        else
            data["timestamp"] = "";

        return data;
    }
});

//collection is an app.Models.NotificationsCollection
app.Views.Notifications = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .show-datetime-filter": "showDateTimeFilter"
    },
    itemView: app.Views.NotificationListItem,
    template: "notifications-list-template",
    emptyView: Backbone.Marionette.ItemView.extend({ template: "notifications-empty-template", tagName: "tr" }),
    initialize: function (options) {
        this.collection = new app.Models.NotificationsCollection({}, { device: this.model });
        if (!_.isUndefined(options) && _.has(options, "timeFilters"))
            this.timeFiltersModel = options.timeFilters;
        else
            this.timeFiltersModel = new app.Models.TimeFilters();

        this.bindTo(this, "composite:collection:rendered", this.StopLoading, this);
    },
    refreshCollection: function () {
        this.collection.closePolling();

        var that = this;
        var params = {};

        var start = this.timeFiltersModel.get("startDateUTCString");
        var end = this.timeFiltersModel.get("endDateUTCString");

        if (!_.isEmpty(start))
            params["start"] = start;
        if (!_.isEmpty(end))
            params["end"] = end;

        this.StartLoading();
        this.collection.fetch({
            data: params,
            success: function () {
                if (_.isEmpty(end))
                    that.collection.pollUpdates();
            }
        });
    },
    StopLoading: function () {
        this.$el.find(".loading-area").hide();
    },
    StartLoading: function () {
        this.$el.find(".loading-area").show();
    },
    onRender: function () {
        this.timeFiltersView = new app.Views.TimeFilters({ model: this.timeFiltersModel });
        var that = this;

        this.timeFiltersView.render().then(function () {
            that.$el.append(that.timeFiltersView.$el);
        });

        this.timeFiltersView.on("applyFilters", function () {
            that.applyDateTimeFilter();
        });
        this.timeFiltersView.on("closeFilters", function () {
            that.timeFiltersView.$el.hide();
        });

        if (this.collection.length >= 100) {
            that.$el.find(".max-rows-number-reached").show();
        }
        else {
            that.$el.find(".max-rows-number-reached").hide();
        }
        
    },
    onClose: function () {
        this.collection.closePolling();
    },
    appendHtml: function (collectionView, itemView, index) {
        if (!("$_itemViewContainer" in collectionView))
            collectionView.$_itemViewContainer = collectionView.$el.find(".child-items-holder");

        collectionView.$_itemViewContainer.prepend(itemView.el);
    },
    showDateTimeFilter: function () {
        var dtBox = this.timeFiltersView.$el;
        var pos = this.$el.find(".show-datetime-filter").offset();

        dtBox.css("top", pos.top);
        dtBox.css("left", pos.left);
        dtBox.show();
    },
    applyDateTimeFilter: function () {
        this.timeFiltersView.$el.hide();
        this.refreshCollection();
    }
});

