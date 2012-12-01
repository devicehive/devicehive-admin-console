app.Views.TimeFilters = Backbone.Marionette.ItemView.extend({
    triggers: {
        "click .apply-datetime-filter": "applyFilters",
        "click .close-datetime-filter": "closeFilters"
    },
    events: {
        "click .set-day": "setDay",
        "click .set-week": "setWeek",
        "click .set-month": "setMonth",
        "click .set-year": "setYear"
    },
    template: "time-filters-template",
    initialize: function (options) {
        if (_.isEmpty(options) || !_.has(options, "model"))
            this.model = new app.Models.TimeFilters();

        var that = this;
        this.bindTo(this.model,"change", function (newVal) {
            that.render();
        });

    },
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });

        if (_.isDate(data.startDate)) 
            data.startDate = this.model.get("startDate").format("mm/dd/yyyy HH:MM");
        else 
            data.startDate = "";
        

        if (_.isDate(data.endDate)) 
            data.endDate = this.model.get("endDate").format("mm/dd/yyyy HH:MM");
        else 
            data.endDate = "";

        return data;
    },
    onRender: function () {
        var that = this;
        this.$el.addClass("datetime-filter-area");
        this.$el.find(".start-datetime").datetimepicker({
            onClose: function (dateText) {
                if (!_.isEmpty(dateText))
                    that.model.set("startDate", that.parseDate(dateText));
                else
                    that.model.set("startDate", null);

            }
        });
        this.$el.find(".end-datetime").datetimepicker({
            onClose: function (dateText) {
                if (!_.isEmpty(dateText))
                    that.model.set("endDate", that.parseDate(dateText));
                else
                    that.model.set("endDate", null);
            }
        });
    },
    parseDate: function (datetimeString) {
        return new Date(datetimeString.substring(6, 10),
                        parseInt(datetimeString.substring(0, 2),10) - 1,
                        datetimeString.substring(3, 5),
                        datetimeString.substring(11, 13),
                        datetimeString.substring(14, 16),
                        datetimeString.substring(17, 19));
    },
    setDay: function () {
        this.model.set("startDate", (new Date()).addDays(-1));
        this.model.set("endDate", null);
    },
    setWeek: function () {
        this.model.set("startDate", (new Date()).addDays(-7));
        this.model.set("endDate", null);
    },
    setMonth: function () {
        this.model.set("startDate", (new Date()).addDays(-30));
        this.model.set("endDate", null);
    },
    setYear: function () {
        this.model.set("startDate", (new Date()).addDays(-365));
        this.model.set("endDate", null);
    }
});

