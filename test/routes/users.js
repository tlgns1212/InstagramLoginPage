var express = require('express');
var router = express.Router();

const mariadb = require('mariadb');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/test', function(req, res, next) {
  res.send('testestestestestseteststestest');
});

module.exports = router;
