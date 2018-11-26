var express = require("express"),
  app = express(),
  http = require("http"),
  server = http.createServer(app);
var rp = require('request-promise');
var cors = require('cors');

var port = process.env.PORT || 8000;

app.use(cors({ origin: '*' }));

app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

const sandbox = "https://api.sandbox.checkout.com";
const live = "https://api.checkout.com";

app.post('/convertStream', function (req, res) {
  var options = {
    method: 'get',
    json: true,
    url: "https://devapi.ckotech.co/webhooktester/events/encode/" + req.body.stream,
  }

  rp(options)
    .then(function (response) {
      res.status(200).send(response);
    })
    .catch(function (err) {
      res.send(err.response);
    });
});

app.get('/getWebhook', function (req, res) {
  let urlBase = "";

  // Check key environment
  if (req.query.key.match(/^sk_test/)) {
    urlBase = sandbox;
  } else if (req.query.key.match(/^sk_/)) {
    urlBase = live;
  } else {
    res.send({
      "key-error": "Invalid Key! Make sure you are using the correct Secret Key"
    })
  }

  var options = {
    method: 'get',
    json: true,
    url: urlBase + "/events/evt_" + req.query.stream,
    headers: {
      'authorization': req.query.key,
    }
  }

  rp(options)
    .then(function (response) {
      res.status(200).send(response);
    })
    .catch(function (err) {
      res.send(err.response);
    });
});

app.post('/retryWebhook', function (req, res) {
  let urlBase = "";

  // Check key environment
  if (req.query.key.match(/^sk_test/)) {
    urlBase = sandbox;
  } else if (req.query.key.match(/^sk_/)) {
    urlBase = live;
  } else {
    res.send({
      "key-error": "Invalid Key! Make sure you are using the correct Secret Key"
    })
  }

  var options = {
    method: 'post',
    json: true,
    url: urlBase + "/events/evt_" + req.query.stream + "/webhooks/retry",
    headers: {
      'authorization': req.query.key,
    }
  }

  rp(options)
    .then(function (response) {
      res.status(200).send({success: 'webhook retry successful'});
    })
    .catch(function (err) {
      res.status(200).send({fail: 'webhook retry unsuccessful'});
    });
});

server.listen(port, function () {
  console.log('Listening on port ' + port + '...')
})