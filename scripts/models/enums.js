app.Enumeration = function (object) {
    _.extend(this, object);
};

app.Enumeration.prototype.getName = function (value) {
    var retKey = "";
    _.each(this, function (propValue, propKey) {
        if (propValue == value)
            retKey = propKey;
    });

    return retKey;
};


app.Enums = { };

app.Enums.NotificationType = new app.Enumeration({ Debug: 0, Notify: 1, Warning: 2, Error: 3 });

app.Enums.UserStatus = new app.Enumeration({ Active: 0, LockedOut: 1, Disabled: 2, Deleted: 3 });

app.Enums.UserRole = new app.Enumeration({ Administrator: 0, Client: 1 });

app.Enums.AccessKeyType = new app.Enumeration({ Default: 0, Session: 1, Oauth: 2 });


