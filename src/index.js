(function() {
  'use strict';

  var request = require('request')

  function App() {
    checkQueryString();
  };

  function checkQueryString() {
    var authorizationCode = getQueryVariable('code');
    var stateToken = getQueryVariable('state');
    var authed = authorizationCode && stateToken;

    if (authed) {
      getAccessToken(authorizationCode);
    } else {
      authoriseUser();
    }
  };

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if(pair[0] == variable){return pair[1];}
    }
    return(false);
  }

  function authoriseUser() {
    var clientId = 'oauthclient_00009CaBEXgA33A8vbCqQL';
    var redirectUri = 'http://localhost:8888/Apps/monzo-playground/index.html';
    var stateToken = 'xcvbngfdtr5y67iuyjhm';
    var url = "https://auth.getmondo.co.uk/?client_id=" + clientId + "&redirect_uri=" + redirectUri + "&response_type=code&state=" + stateToken;
    window.open(url);
  };

  function getAccessToken(authorizationCode) {
    var clientId = 'oauthclient_00009CaBEXgA33A8vbCqQL';
    var redirectUri = 'http://localhost:8888/Apps/monzo-playground/index.html';
    var clientSecret = 'WXIXJDX1zNpWUFvpjRtFrT1/T/X/NFx1JUQfIE4HNYF/6L0nON4An5ciMMlbcEM0nYAy5Kgvtpc+75F8alzk';
    var url = "https://api.monzo.com/oauth2/token";

    var options = {
      method: 'POST',
      uri: url,
      form: {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: authorizationCode
      }
    }

    request(options, function (error, response, body) {
      console.log(error);
      if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the Google homepage.
        requestAccounts(body);
      }
    });
  };

  function requestAccounts(data) {
    var dat = JSON.parse(data);
    console.log(dat);
    console.log('hi ', dat.access_token);
    var url = "https://api.monzo.com/balance";

    var options = {
      uri: url,
      headers: {
        Authorization: 'Bearer ' + dat.access_token
      },
      qs: {
        account_id: dat.user_id
      }
    }

    request(options, function (error, response, body) {
      console.log(error);
      if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the Google homepage.
      }
    });
  };

  var app = new App();
})();
