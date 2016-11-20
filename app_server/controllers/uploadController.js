var fs = require('fs');
var Busboy = require('busboy');
var mongo = require('mongodb');
var Grid = require('gridfs-stream');
var db = new mongo.Db('mongoImage', new mongo.Server("127.0.0.1", 27017), {safe: false});
var gfs;
var util = require('util');
var bodyParser = require('body-parser');

db.open(function (err) {
    if (err) {
        throw err;
    }
    gfs = Grid(db, mongo);
});

module.exports.doUpload = function (req, res) {


    var busboy = new Busboy({headers: req.headers});
    var fileId = new mongo.ObjectId();

    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log('got file', filename, mimetype, encoding);
        var writeStream = gfs.createWriteStream({
            _id: fileId,
            filename: filename,
            mode: 'w',
            content_type: mimetype
        });
        file.pipe(writeStream);
    }).on('finish', function () {
        // show a link to the uploaded file
        res.writeHead(200, {'content-type': 'text/html'});
        res.end('<a href="/image">查看图片</a>');
    });

    req.pipe(busboy);
};

module.exports.getImage = function (req, res) {
    var _id = new mongo.ObjectId(req.query.imageId);
    gfs.files.findOne({'_id': _id}, function (err, file) {
    // gfs.files.find({}).toArray(function (err, files) {
    //     console.log(util.inspect(file, {showHidden: false, depth: null}));
        if (err) return res.status(400).send(err);
        if (!file) return res.status(404).send('');

        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', 'attachment; filename=""');

        var readstream = gfs.createReadStream({
            _id: file._id
        });

        readstream.on("error", function(err) {
            console.log("Got error while processing stream " + err.message);
            res.end();
        });

        readstream.pipe(res);
    });
};

module.exports.getImageList = function (req, res) {
    gfs.files.find({}, {'_id' : 1}).toArray(function (err, filesId) {
        // console.log(util.inspect(filesId, {showHidden: false, depth: null}));
        var filesIdArray = [];
        filesId.forEach(function (item) {
            filesIdArray.push(item._id);
        });
        res.render('imageList', {ids: filesIdArray});
    });
};