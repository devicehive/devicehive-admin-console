app.Models.TimeFilters = Backbone.Model.extend({
    initialize: function (options) {
        if (_.isEmpty(options) || !_.has(options, "startDate"))
             this.set("startDate",(new Date()).addDays(-7));
    },
    defaults: { startDate: null, endDate: null },
    getters: {
        startDateUTCString: function () {
            if (_.isDate(this.get("startDate")))
                return this.get("startDate").format("yyyy-mm-dd'T'HH:MM:ss.l");
            else return null;
        },
        endDateUTCString: function () {
            if (_.isDate(this.get("endDate")))
                return this.get("endDate").format("yyyy-mm-dd'T'HH:MM:ss.l");
            else return null;
        }
    }
});
