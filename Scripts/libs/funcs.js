Backbone.Marionette.Application.prototype.f = {
    //gets the list of time strings(with microseconds) and return the maximum
    getMaxTimeMicro: function (list) {
        if (!_.isArray(list)) return "";

        //convert to tics and add the microseconds. 
        //Map to a list of objects {value:integerRepresentation,str:strignRepresentation} 
        //If some empty values occures return null
        var intAndStr = _.map(list, function (curStamp) {
            if (_.isString(curStamp)) {
                var index = curStamp.length;
                return { value: parseInt(Backbone.Marionette.Application.prototype.f.parseUTCstring(curStamp).getTime() + curStamp.substring(index - 3, index)), str: curStamp };
            }
            else return null;
        });

        //compare by integers
        var timestamp = _.max(intAndStr, function (timeObj) {
            if (_.isNull(timeObj)) return 0;
            else return timeObj.value;
        });


        if (_.isEmpty(timestamp)) return "";
        else return timestamp.str;
    },
    //use for utc-formatted strings
    parseUTCstring: function (datetimeString) {
        return new Date(datetimeString.substring(0, 4),
                        parseInt(datetimeString.substring(5, 7),10) - 1,
                        datetimeString.substring(8, 10),
                        datetimeString.substring(11, 13),
                        datetimeString.substring(14, 16),
                        datetimeString.substring(17, 19),
                        datetimeString.substring(20, 23));
    },
    toISOString: function (date) {
        return date.format(dateFormat.masks.isoUtcDateTime);
    }
};

Date.prototype.addDays = function (days) {
    var newDate = (new Date(this).getTime()) + days * 86400000;
    return new Date(newDate);
};