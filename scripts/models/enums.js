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


app.Enums = {};

app.Enums.NotificationType = new app.Enumeration({Debug: 0, Notify: 1, Warning: 2, Error: 3});

app.Enums.UserStatus = new app.Enumeration({Active: 0, LockedOut: 1, Disabled: 2, Deleted: 3});

app.Enums.UserRole = new app.Enumeration({Administrator: 0, Client: 1});


