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