/**
 * Created by Sergey on 10/9/2015.
 */
Backbone.Marionette.TemplateCache.prototype.loadTemplate = function (templateId, callback) {
    var url = app.config.rootUrl + "/scripts/templates/" + templateId + ".html";
    url = url.replace('//', '/');

    var templateHtml = '';
    $.ajax({ method: 'GET', url: url, async: false, cache:false, success: function (data) {
        templateHtml = data;
    }});
    return $(templateHtml).html();
};
