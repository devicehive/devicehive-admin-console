app.module("Modules.Login", function (users, app) {
    var loginView = new app.Views.Login();
    var controller = {
        'auth': function() {
            app.Regions.bottomWorkArea.close();
            app.vent.trigger("stopLoading");
            if ((sessionStorage.userLogin && sessionStorage.userPassword) || sessionStorage.deviceHiveToken) {
                Backbone.history.navigate('', {trigger: true});
                return;
            } else {
                app.Regions.topWorkArea.show(loginView);
            }
        },
        'logout': function() {
            delete sessionStorage.userLogin;
            delete sessionStorage.userPassword;
            if (sessionStorage.deviceHiveToken) {
                sendLogoutRequest();
                delete sessionStorage.deviceHiveToken;
            }
            Backbone.history.navigate('', { trigger: false });
            location.reload(true);
        }
    };
    var routes = {
        auth: 'auth',
        logout: 'logout'
    };
    var router = Backbone.Marionette.AppRouter.extend({ controller: controller, appRoutes: routes });
    app.addInitializer(function (options) {
        var rtr = new router();
    });

    var sendLogoutRequest = function () {
        var xhr = new XMLHttpRequest();
        xhr.open('DELETE', app.config.restEndpoint + '/oauth2/accesskey', true);
        xhr.setRequestHeader('Authorization', "Bearer " + sessionStorage.deviceHiveToken);

        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4) {
                if(xhr.status != 200){
                    console.log(xhr.response);
                }
            }
        };
        xhr.send(null);
    };

});
