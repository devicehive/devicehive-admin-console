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
app.module("Modules.Notifications", function (users, app) {

    var overlay = $("<div class='overlay'><div class='overlay-loading'></div></div>");

    var errorHandler = function (errorObject, message) {
        var errorMessage = "";
        if (!_.isUndefined(message))
            errorMessage += message + "\n ";

        if (_.isString(errorObject)) {
            errorMessage += errorObject;
        } else
            if (_.has(errorObject, "responseText") && _.has(errorObject, "status") && _.has(errorObject, "readyState")) {
                var jResp = errorObject.responseText;
                try {
                    jResp = $.parseJSON(errorObject.responseText);
                    if (_.has(jResp, "message"))
                        errorMessage += jResp.message;
                    else if (_.has(jResp, "Message"))
                        errorMessage += jResp.Message;
                    else
                        errorMessage += JSON.stringify(jResp);
                }
                catch (ex) {
                    errorMessage += jResp;
                }
            }
            else if (_.has(errorObject, "status") && _.has(errorObject, "readyState") && errorObject.status == 500) {
                errorMessage = "Unknown server error";
            }


        alert(errorMessage);
    };

    var notificationsHandler = function (status, errorObject, message) {
        if (status >= app.Enums.NotificationType.Error) {
            errorHandler(errorObject, message);
        }
    };

    var startLoadingHandler = function () {
        $(document.documentElement).prepend(overlay);
    };

    var stopLoadingHandler = function () {
        overlay.remove();
    };

    app.addInitializer(function (options) {
        app.vent.on("notification", notificationsHandler);
        app.vent.on("startLoading", startLoadingHandler);
        app.vent.on("stopLoading", stopLoadingHandler);
    });
});