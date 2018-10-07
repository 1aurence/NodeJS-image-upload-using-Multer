const express = require('express');
const multer = require('multer')
const ejs = require('ejs')
const path = require('path')
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

mongoose.connect('mongodb://admin:password1@ds123003.mlab.com:23003/review', () => {
    console.log('connected to db')
}).catch((err) => console.log(err))

const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    }
}).single('myImg')

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLocaleLowerCase())
    const mimetype = filetypes.test(file.mimetype)
    if (mimetype && extname) return cb(null, true)
    cb('Error: Images only')
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// app.use(morgan('dev'));
var imgSchema = new mongoose.Schema({
    img: {
        data: Buffer,
        contentType: String
    }
});

// our model
var Img = mongoose.model('Img', imgSchema);
app.set('view engine', 'ejs');
app.use(express.static('./public'));

app.get('/', (req, res) => res.render("index"));
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        console.log(req)
        if (err) res.render('index', {
            msg: err
        })
        if (req.file == undefined) res.render('index', {
            msg: 'Error: no file selected'
        })
        res.render('index', {
            msg: 'File uploaded',
            file: `uploads/${req.file.filename}`
        })
    })
})
const port = 3000
app.listen(port)