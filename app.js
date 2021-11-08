const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const bodyParser = require("body-parser");
const fs = require("fs");
const { createBrotliCompress } = require('zlib');
const { REPL_MODE_STRICT } = require('repl');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const storage = multer.diskStorage({ 
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null,file.fieldname + '-' + Date.now() +
        path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('myImage');

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: Images Only!');
    }
}


app.set('view engine', 'ejs');

app.use(express.static('./public'));

app.get('/', (req, res) => res.render('index'));

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if(err){
            res.render('index', {
                msg: err
            });
        } else {
            if(req.file == undefined){
                res.render('index', {
                    msg: 'Error: No File Selected!'
                });
            } else {
                res.render('index', {
                    msg: 'File Uploaded!',
                    file: `uploads/${req.file.filename}`
                })
            }
        }
    })
})

app.get("/files", (req, res)=> {
    fs.readdir("public/uploads", (err, files) => {
        res.render("files", {
            Files: files,
        });
    });
});

app.post("/delete/:file", (req, res, next) => {
    deletefile = "public/uploads" + req.params.file;
    fs.unlink(deletefile, (err) => {
        if (err) {
            return err;
        }
        fs.readdir("public/uploads", (err, files) => {
            res.render("files", {
                Files:files,
            });
        });
    });
});

app.post("/rename/:file", (req, res) => {
    recName = req.body.rename;
    fileName = req.params.file;
    ext = fileName.split(".");
    extension = ext[1];
    fileDirectory = "public/uploads";
    newName = recName + "." + extension;
    fs.rename(fileDirectory + fileName, fileDirectory + newName, (err) => {
        if (err) {
            console.log(err);
        }
        fs.readdir("public/uploads", (err,files) => {
            res.render("files", {
                Files:files,
            });
        });
    });
});

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));