app.module("Modules.Login", function (users, app) {
    var loginView = new app.Views.Login();
    var controller = {
        'auth': function() {
            app.Regions.bottomWorkArea.close();
            app.vent.trigger("stopLoading");
            if (localStorage.deviceHiveToken) {
                Backbone.history.navigate('', {trigger: true});
                return;
            } else {
                app.Regions.topWorkArea.show(loginView);
            }
        },
        'logout': function() {
            sendLogoutRequest();
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

        //$.ajax({
        //    url: app.config.restEndpoint + '/auth/accesskey',
        //    type: 'DELETE',
        //    beforeSend: function (xhr) {
        //        xhr.setRequestHeader('Authorization', "Bearer " + localStorage.deviceHiveToken);
        //    }
        //}).always(function () {
            delete localStorage.deviceHiveToken;
            Backbone.history.navigate('', { trigger: false });
            location.reload(true);
        //});
    };

});
