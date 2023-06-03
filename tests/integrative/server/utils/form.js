const busboy = require('busboy')
const fs = require('fs');
const {join} = require('path')
const downloadsPath = join(__dirname,'..','..','downloads')
module.exports = function (req,res) {
   const bb = busboy({ headers: req.headers });
   return new Promise((resolve,reject) => {
      let fields = []
      let files = []
      bb.on('file', (name, file, info) => {
         const filename = info.filename || name
         const writeStream = fs.createWriteStream(join(downloadsPath,filename));
         info.name = name
         file.on('data', (data) => {
            info.size = data.length
            writeStream.write(data);
         });
         files.push(info)
         file.on('end', () => writeStream.end());
      });
      bb.on('field', (name, val, info) => fields.push({[name]:val}));
      bb.on('close', () => resolve({files,fields}));
      req.pipe(bb);
   })
}