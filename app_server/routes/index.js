var express = require('express');
var router = express.Router();
var uploadController = require('../controllers/uploadController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/upload', function (req, res) {
  res.render('upload');
});

router.post('/uploaded', function (req, res) {
  uploadController.doUpload(req, res);
});

router.get('/image', function (req, res) {
  uploadController.getImage(req, res);
});

router.get('/imageList', function (req, res) {
  uploadController.getImageList(req, res);
});
module.exports = router;
