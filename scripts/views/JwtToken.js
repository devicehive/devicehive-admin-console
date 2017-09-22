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
//model is an app.Models.JwtToken
app.Views.JwtToken= Backbone.Marionette.ItemView.extend({
    events: {
        "click .show-datetime-selector": "showDateTimeFilter",
        "submit form": "getTokens",
        "click #refreshTokenHolder": "copyRefreshToken",
        "click #accessTokenHolder": "copyAccessToken"
    },
    template: "jwt-token-template",
    initialize: function (options) {
        this.userData = app.parseJwt(localStorage.deviceHiveToken);
        this.data = {};
        this.data.accessToken = "";
        this.data.refreshToken = "";
        this.data.accessTokenExpirationDate = "";
        this.data.refreshTokenExpirationDate = "";
        this.expirationTokenDate =  "";

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
            'accessTokenExpirationDate': this.data.accessTokenExpirationDate,
            'refreshTokenExpirationDate': this.data.refreshTokenExpirationDate
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
        that.$el.find('.token-holder').tooltip();

        //New User JwtToken hints
        if (app.User && (!(localStorage.introReviewed) || (localStorage.introReviewed === 'false'))) {
            var enjoyhint_instance = new EnjoyHint({});
            var enjoyhint_script_steps = [];
            var generatedJWTtoken = this.$el.find('.jwt-token-container');

            if(generatedJWTtoken.length > 0) {
                enjoyhint_script_steps = app.hints.jwtTokenHintsWithToken;
            } else {
                enjoyhint_script_steps = app.hints.jwtTokenHints;
            }
            enjoyhint_instance.set(enjoyhint_script_steps);
            enjoyhint_instance.run();

            $(".enjoyhint_skip_btn").on("click", function() {
                app.disableNewUserHints();
            });
        }
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
        if (!this.userData) {
            this.userData = app.parseJwt(localStorage.deviceHiveToken);
        }

        var extendedPayload = app.formatPayload(this.userData.payload);
        extendedPayload.expiration = this.expirationTokenDate;

        JWTTokenModel.generateDeviceJwtTokens(extendedPayload, function(tokens) {
            that.data.accessToken = tokens.accessToken;
            that.data.accessTokenExpirationDate = new Date(app.parseJwt(tokens.accessToken).payload.e).format("mm/dd/yyyy HH:MM Z");
            that.data.refreshToken = tokens.refreshToken;
            that.data.refreshTokenExpirationDate = new Date(app.parseJwt(tokens.refreshToken).payload.e).format("mm/dd/yyyy HH:MM Z");
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
    },

    copyAccessToken: function(element) {
        var that = this;
        this.copyToClipboard(element);
        $('#copy-access-token-message').show();
        setTimeout(function() {
            that.$el.find('#copy-access-token-message').fadeOut('fast');
        }, 1000);
    },

    copyRefreshToken: function(element) {
        var that = this;
        this.copyToClipboard(element);
        $('#copy-refresh-token-message').show();
        setTimeout(function() {
            that.$el.find('#copy-refresh-token-message').fadeOut('fast');
        }, 1000);
    },

    // Function to copy to clipboard
    copyToClipboard: function(element) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(element.target.innerHTML).select();
        document.execCommand("copy");
        $temp.remove();
    }
});