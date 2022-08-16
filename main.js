var express = require('express')
var app = express()
var MongoClient = require('mongodb').MongoClient

var url = 'mongodb://localhost:27017'
// var url = 'mongodb+srv://admin:admin@cluster0.obcngim.mongodb.net/test'
const { ObjectId } = require('mongodb')


app.set('view engine', 'hbs')
app.use(express.urlencoded({extended : true}))
app.use(express.static('img'));
app.use(express.static('style'));


app.get('/', (req,res)=>{
    res.render('home')
})

app.get('/new', (req, res) => {
    res.render('newToy')
})

app.get('/view', async (req, res) => {
    let client = await MongoClient.connect(url);
    let dbo = client.db("ToyData")
    let toys = await dbo.collection("Toys").find().toArray()
    res.render('viewToys', { 'toys': toys })
})

app.post('/insertToy', async (req, res) => {
    let name = req.body.txtName
    let price = Number(req.body.txtPrice)
    let picURL = req.body.txtPic
    if(name.length < 6 ){
        res.render('newToy',{'error': 'Name must have at last 6 characters'})
    } else {
    let toy = {
        'name': name,
        'price': price,
        'picture': picURL
    }
    let client = await MongoClient.connect(url);
    let dbo = client.db("ToyData")
    await dbo.collection("Toys").insertOne(toy)
    res.redirect('/')
    }
    })


app.post('/search', async (req, res) => {
    let name = req.body.txtSearch
    let client = await MongoClient.connect(url);
    let dbo = client.db("ToyData")
    let toys = await dbo.collection("Toys").find({ 'name': new RegExp(name, 'i') }).toArray()
    res.render('searchToy', { 'toys': toys, 'name':name })
})

app.get('/delete', async (req, res) => {
    
    let id = req.query.id
    let objectId = ObjectId(id)
    let client = await MongoClient.connect(url);
    let dbo = client.db("ToyData");
    await dbo.collection("Toys").deleteOne({ _id: objectId })
    res.redirect('/view')
})


app.post('/update', async (req, res) => {
    let id = req.body.id
    let objectId = ObjectId(id)
    let name = req.body.txtName
    let price = Number(req.body.txtPrice)
    let picURL = req.body.txtPic
    let toy = {
        'name': name,
        'price': price,
        'picture': picURL
    }
    let client = await MongoClient.connect(url);
    let dbo = client.db("ToyData");
    await dbo.collection("Toys").updateOne({ _id: objectId }, { $set: toy })
    res.redirect('/')
})


app.get('/edit', async (req, res) => {
    let id = req.query.id
    let objectId = ObjectId(id)
    let client = await MongoClient.connect(url);
    let dbo = client.db("ToyData");
    let toy = await dbo.collection("Toys").findOne({ _id: objectId })
    res.render('editToy', { 'toy': toy })
})


const PORT = process.env.PORT || 5000

app.listen(PORT)
console.log('Server running!')