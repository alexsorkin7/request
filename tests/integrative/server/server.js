const express = require('express')
const app = express()
const {join} = require('path')
const form = require('./utils/form')
const genFile = require('./utils/gen-file')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.delete('/',(req,res) => res.end('This is a DELETE route'))
app.post('/',(req,res) => res.end('This is a POST route'))
app.put('/',(req,res) => res.end('This is a PUT route'))
app.get('/', (req,res) => res.json({ message: 'This is a GET route', data:req.query }))
app.get('/image',(req,res) => res.sendFile(join(__dirname,'..','imgs','image.jpg')))
app.post('/post-json',(req,res) => res.json({ message: 'This is a POST JSON route', data:req.body }))
app.get('/file/:size',(req,res) => genFile(req,res))

app.post('/post-formdata',(req,res) => {
   form(req,res).then(({files,fields}) => {
      res.json({message:'This is a POST form-data route',files,fields});
   })
})

if(process.argv[2] == '-run') app.listen(3000)

module.exports = function() {
   app.listen(3000)
}