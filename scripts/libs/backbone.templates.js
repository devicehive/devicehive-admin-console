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
/**
 * Created by Sergey on 10/9/2015.
 */
Backbone.Marionette.TemplateCache.prototype.loadTemplate = function (templateId, callback) {
    var url = app.config.rootUrl + "scripts/templates/" + templateId + ".html";
    url = url.replace('//', '/');

    var templateHtml = '';
    $.ajax({ method: 'GET', url: url, async: false, cache:false, success: function (data) {
        templateHtml = data;
    }});
    return $(templateHtml).html();
};
