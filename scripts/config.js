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

app.config = {
    restEndpoint: '/api/rest',
    rootUrl: "/admin/",
    pushState: false,
    //Session Life Time in minutes
    sessionLifeTime: 30,
    //Session Life Time ratio
    sessionLifeTimeRatio: 1/4,
    sessionExpiredRedirectUrl: '/#auth'
};

app.hints = {
    jwtTokenHints: [
        {'next .create-jwt-token': 'Click to create new JWT Token'},
        {'click .show-datetime-selector': 'Click to set expiration date for new JWT Token'}
    ],
    usersHints: [
        {'click .add-new-user': 'Click to create new User'},
        {'next #login': 'Enter User name'},
        {'next #role': 'Select User role'},
        {'next #status': 'Select User status'},
        {'next #password': 'Enter User password'},
        {'next #password-confirmation': 'Confirm User password'},
        {'next #data': 'Enter User data'},
        {'next .btn-success': 'Create new User'}
    ],
    devicesHints: [
        {'click .add-device': 'Click to create new Device'},
        {'next .new-device-name' : 'Enter Device Name'},
        {'next .new-device-network' : 'Select Device Network'},
        {'next .new-device-data' : 'Enter Device Data'},
        {'click .save-device' : 'Click Save'}
    ],
    networksHints: [
        {'next .networks-table': 'Default Network was created'},
        {'next a[data-path="devices"]': 'YOu can create new device and assign it to your network via Devices page'},
        {'next .add-new-network': 'Click to create your own new Network'}
    ]

};