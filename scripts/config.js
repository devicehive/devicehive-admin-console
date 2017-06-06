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
    rootUrl: '/admin/',
    pushState: false,
    //Session Life Time in minutes
    sessionLifeTime: 30,
    //Session Life Time ratio
    sessionLifeTimeRatio: 1/4,
    sessionExpiredRedirectUrl: '/#auth'
};

app.hints = {
    jwtTokenHintsWithToken: [
        {
            'next .jwt-token-container': 'This is your JWT Token. You can use it for connecting your devices.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next .jwt-refresh-token-container': 'This is your refresh token. You can use this one to refresh your JWT Token.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click .show-datetime-selector': 'Click to set expiration date for new JWT Token',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        }
    ],
    jwtTokenHints: [
        {
            'next .create-jwt-token': 'Click to create new JWT Token',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click .show-datetime-selector': 'Click to set expiration date for new JWT Token',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        }
    ],
    usersHints: [
        {
            'click .add-new-user': 'Click to create new User',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next #login': 'Enter User name',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next #role': 'Select User role',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next #status': 'Select User status',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next #password': 'Enter User password',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next #password-confirmation': 'Confirm User password',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next #data': 'Enter User data',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next .btn-success': 'Create new User',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click .networks:last': 'Click to assign Network to user.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        }
    ],
    devicesHintsWithNetwork: [
        {
            'next a[data-path="devices"]': 'This is the page where you can manage your devices',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next a[data-path="networks"]': 'Here you can see available Networks.Please contact administrator for granting access to some particular network.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click .add-device': 'You can create new device',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click a[data-path="jwt-token"]': 'Navigate to generate JWT token for your devices.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        }
    ],
    devicesHintsClientWithNoNetworks: [
        {
            'next a[data-path="devices"]': 'This is the page where you can manage your devices',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next a[data-path="networks"]': 'Here you can see available Networks.Please contact administrator for granting access to some particular network.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next .add-device': 'You will be able to create new Device after administrator will grand you an access to any network',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click a[data-path="jwt-token"]': 'Navigate to generate JWT token for your devices.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        }
    ],
    devicesHintsWithDevice: [
        {
            'next a[data-path="devices"]': 'This is the page where you can manage your devices',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next a[data-path="networks"]': 'Here you can see available Networks.Please contact administrator for granting access to some particular network.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next tbody tr:first': 'This device was assign by administrator',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click .detail': 'Check out Device details',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click a[data-path="jwt-token"]': 'Navigate to generate JWT token for your devices.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        }
    ],
    devicesHintsAdmin: [
        {
            'next a[data-path="devices"]': 'This is the page where you can manage Devices',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next a[data-path="networks"]': 'This is the page where you can manage Networks.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next a[data-path="user"]': 'This is the page where you can manage Users: create a new one, edit or delete existing and grant access to networks.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next tbody tr:first': 'This is your Devices list',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click .add-device': 'You can create a new Device',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click .detail': 'Check out Device details',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click a[data-path="jwt-token"]': 'Navigate to generate JWT token for your devices.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        }
    ],
    devicesHintsAdminWithNoDevices: [
        {
            'next a[data-path="devices"]': 'This is the page where you can manage Devices',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next a[data-path="networks"]': 'This is the page where you can manage Networks.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next a[data-path="user"]': 'This is the page where you can manage Users: create a new one, edit or delete existing and grant access to networks.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next tbody tr:first': 'This is your Devices list',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click .add-device': 'You can create a new Device',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click a[data-path="jwt-token"]': 'Navigate to generate JWT token for your devices.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        }
    ],
    networksHintsAdmin: [
        {
            'next tr:first': 'You can check your Networks list',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click .add-new-network': 'Click to create your own new Network',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next a[data-path="devices"]': 'YOu can create new device and assign it to your network via Devices page',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next a[data-path="user"]': 'This is the page where you can manage Users: create a new one, edit or delete existing and grant access to networks.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click a[data-path="jwt-token"]': 'Navigate to generate JWT token for your devices.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        }
    ],
    networksHintsClient: [
        {
            'next .networks-table': 'You can check your Networks list',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next a[data-path="devices"]': 'YOu can create new device and assign it to your network via Devices page',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click a[data-path="jwt-token"]': 'Navigate to generate JWT token for your devices.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        }
    ],
    userNetworksHintsAdmin : [
        {
            'next #registered-networks' : 'Select network to grand user access',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'click .accept' : 'Grand user access for selected network',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        },
        {
            'next tbody tr:first' : 'Observe networks available for user.',
            'skipButton' : {className: 'customSkipBtn', text: 'Skip tutorial'}
        }
    ]

};