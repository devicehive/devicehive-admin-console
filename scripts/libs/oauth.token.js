/**
 * Created by tmatvienko on 11/26/14.
 */
$(document).ready(function () {
    var deviceHiveAdminConsole = "http://" + window.location.host + app.config.rootUrl;

    var params = {}, queryString = location.hash.substring(1),
        regex = /([^&=]+)=([^&]*)/g, m;
    if (queryString && "auth" != queryString) {
        while (m = regex.exec(queryString)) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', app.config.restEndpoint + '/oauth2/token/apply?' + queryString, true);
        xhr.setRequestHeader('Authorization', 'Identity');

        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4) {
                if(xhr.status == 200){
                    var token = xhr.response;
                    if (token) {
                        sessionStorage.deviceHiveToken=token;
                        sessionStorage.lastActivity=(new Date()).valueOf();
                        document.location.href = deviceHiveAdminConsole;
                    }
                } else {
                    document.body.innerHTML = xhr.response;
                }
            }
        };
        xhr.send(null);
    }
});