const express = require('express');
const mongoose = require ('mongoose')
const ejs = require('ejs');
const path = require('path');
const Photo = require('./models/Photo')

const app = express();

//connect db
mongoose.connect('mongodb://localhost/pcat-test-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// TEMPLATE ENGİNE
app.set('view engine', 'ejs');

//MIDDLEWARES
app.use(express.static('public'));
app.use(express.urlencoded({extended:true})) //urldeki datayı okumamızı sağlar
app.use(express.json()) // Yukardaki ve bu body parser için kullanılıyormuş. Bu ikisini yazdığımızda formdan gönderdiğimiz veriyi req.body ile yakalayıp konsola yazdırabildik. Bunlar middleware. datayı json formatına döndürmeyi sağlar

//ROUTES
app.get('/',async (req, res) => {
  const photos = await Photo.find({})
  res.render('index',{
    photos // bu aynı zamanda photos: photos komutudur veritabanından aldık photo verilerini index.ejs ye yolladık
  });
});

app.get('/photos/:id', async (req, res) => {
 // console.log(req.params.id) // yakaladığımız id'yi log ile ekrana yazdırdık
  const photo = await Photo.findById(req.params.id) // burdaki fotoğraf bilgisini alana kadar beklemek istiyorum o yüzden await
  res.render('photo',{
    photo
  });
});
app.get('/about', (req, res) => {
  res.render('about');
});
app.get('/add', (req, res) => {
  res.render('add');
});
app.post('/photos', async (req, res) => {
  await Photo.create(req.body)
  res.redirect('/')
});

const port = 3000;

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı...`);
});
