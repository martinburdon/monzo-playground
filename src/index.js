(function() {
  'use strict';

  var request = require('request');

  // var redirectUri = 'http://localhost:8888/Apps/monzo-playground/index.html';
  var redirectUri = 'http://localhost:8888/monzo-playground/index.html';
  var clientId = 'oauthclient_00009CaBEXgA33A8vbCqQL';
  var clientSecret = 'WXIXJDX1zNpWUFvpjRtFrT1/T/X/NFx1JUQfIE4HNYF/6L0nON4An5ciMMlbcEM0nYAy5Kgvtpc+75F8alzk';

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

  // Redirect to Monzo to get an authorizationCode
  function authoriseUser() {
    var url = "https://auth.getmondo.co.uk/?client_id=" + clientId + "&redirect_uri=" + redirectUri + "&response_type=code&state=xcvbngfdtr5y67iuyjhm";
    window.open(url);
  };

  // Get an access token so we can make requests
  function getAccessToken(authorizationCode) {
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
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var dat = JSON.parse(body);
        var accessToken = dat.access_token;
        requestAccountDetails(body)
        .then((data) => {
          requestBalance(data, accessToken);
          requestTransactions(data, accessToken);
        });
      }
    });
  };

  // Get users name, creation date and account ID
  function requestAccountDetails(data) {
    return new Promise((resolve, reject) => {
      var dat = JSON.parse(data);
      var url = "https://api.monzo.com/accounts";

      var options = {
        uri: url,
        headers: {
          Authorization: 'Bearer ' + dat.access_token
        }
      }

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          resolve(body);
        }
      });
    });
  };

  // Get balance
  function requestBalance(data, accessToken) {
    var dat = JSON.parse(data);
    var userId = dat.accounts[0].id;
    var url = "https://api.monzo.com/balance";

    var options = {
      uri: url,
      headers: {
        Authorization: 'Bearer ' + accessToken
      },
      qs: {
        account_id: userId
      }
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      } else {
        console.log('error ', error);
      }
    });
  };

  function requestTransactions(data, accessToken) {
    var dat = JSON.parse(data);
    var userId = dat.accounts[0].id;
    var url = "https://api.monzo.com/transactions";

    var options = {
      uri: url,
      headers: {
        Authorization: 'Bearer ' + accessToken
      },
      qs: {
        account_id: userId
      }
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var transactions = JSON.parse(body);
        console.log(transactions);
      } else {
        console.log('error ', error);
      }
    });
  };

  var app = new App();
})();


// browserify src/index.js -o src/bundle.js -d
