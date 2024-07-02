const express = require('express');
const router = express.Router();

/* GET users listing. */
// this route will be used when a URL of `/users/` is received.
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;

router.get('/cool', function (req, res, next) {
  res.send("You're so cool")
})