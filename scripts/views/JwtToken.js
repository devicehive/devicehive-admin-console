/**
 * Created by dananskyi on 5/22/17.
 */

//model is an app.Models.JwtToken
app.Views.JwtToken= Backbone.Marionette.ItemView.extend({
    events: {
        "click .show-datetime-selector": "showDateTimeFilter",
        "submit form": "getTokens",
    },
    template: "jwt-token-template",
    initialize: function (options) {
        this.userData = this.parseJwt(localStorage.deviceHiveToken);
        this.data = {};
        this.data.accessToken = "";
        this.data.refreshToken = "";
        //Set default JWT Token live time to 7 day
        this.expirationTokenDate = (new Date()).addDays(+7).toISOString();


        if (!_.isUndefined(options) && _.has(options, "timeFilters"))
            this.timeFiltersModel = options.timeFilters;
        else
            this.timeFiltersModel = new app.Models.TimeFilters();

        this.bindTo(this, "composite:collection:rendered", this.StopLoading, this);
    },

    serializeData: function(){
        return {
            'accessToken': this.data.accessToken,
            'refreshToken': this.data.refreshToken,
        }
    },
    parseJwt: function (token) {
        if(token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse(window.atob(base64));
        }
    },
    onRender: function () {
        this.timeFiltersView = new app.Views.ExpirationTimeSelector({ model: this.timeFiltersModel });
        var that = this;

        this.timeFiltersView.render();
        this.$el.append(that.timeFiltersView.$el);

        this.timeFiltersView.on("applyFilters", function () {
            that.applyDateTimeFilter();
        });
        this.timeFiltersView.on("closeFilters", function () {
            that.timeFiltersView.$el.hide();
        });
    },

    applyDateTimeFilter: function() {
        this.expirationTokenDate = (this.timeFiltersModel.attributes.endDate) ? this.timeFiltersModel.get("endDateUTCString"): this.expirationTokenDate;
        this.timeFiltersView.$el.hide();
        this.generateJWTTokens();
    },

    StopLoading: function () {
        this.$el.find(".loading-area").hide();
    },
    StartLoading: function () {
        this.$el.find(".loading-area").show();
    },

    generateJWTTokens: function() {
        var that = this;
        var JWTTokenModel = new app.Models.JwtToken();
        this.userData.payload.expiration = this.expirationTokenDate;
        JWTTokenModel.generateDeviceJwtTokens(this.userData.payload, function(tokens) {
            that.data.accessToken = tokens.accessToken;
            that.data.refreshToken = tokens.refreshToken;
            that.render();
        });
    },

    getTokens: function(e) {
        e.preventDefault();
        this.generateJWTTokens();
    },

    showDateTimeFilter: function () {
        var dtBox = this.timeFiltersView.$el;
        var pos = this.$el.find(".show-datetime-selector").offset();

        dtBox.css("top", pos.top - 20);
        dtBox.css("left", pos.left);
        dtBox.show();
    }
});