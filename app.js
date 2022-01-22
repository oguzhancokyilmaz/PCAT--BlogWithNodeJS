const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs'); // dosya işlemleri için
const Photo = require('./models/Photo');
const { Console } = require('console');

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
app.use(express.urlencoded({ extended: true })); //urldeki datayı okumamızı sağlar
app.use(express.json()); // Yukardaki ve bu body parser için kullanılıyormuş. Bu ikisini yazdığımızda formdan gönderdiğimiz veriyi req.body ile yakalayıp konsola yazdırabildik. Bunlar middleware. datayı json formatına döndürmeyi sağlar
app.use(fileUpload()); // fileUpload middleware'i
app.use(methodOverride('_method')); // Bilgileri edit ederken put isteği yapmamız gerekir ama tarayıcılar get post destekler bunun için methodOverride kullanırız

//ROUTES
app.get('/', async (req, res) => {
  const photos = await Photo.find({}).sort('-dateCreated'); // başa eksi koyunca tersten sıraladı
  res.render('index', {
    photos, // bu aynı zamanda photos: photos komutudur veritabanından aldık photo verilerini index.ejs ye yolladık
  });
});

app.get('/photos/:id', async (req, res) => {
  // console.log(req.params.id) // yakaladığımız id'yi log ile ekrana yazdırdık
  const photo = await Photo.findById(req.params.id); // burdaki fotoğraf bilgisini alana kadar beklemek istiyorum o yüzden await
  res.render('photo', {
    photo,
  });
});
app.get('/about', (req, res) => {
  res.render('about');
});
app.get('/add', (req, res) => {
  res.render('add');
});
app.post('/photos', async (req, res) => {
  //console.log(req.files.image);// burdaki image formumuzda file labelimizin
  /* await Photo.create(req.body);
  res.redirect('/'); */

  const uploadDir = 'public/uploads';
  if (!fs.existsSync(uploadDir)) {
    // eğer uploadDir yoksa(oluşmamışsa)
    fs.mkdirSync(uploadDir); // sync fonksiyon önce bunu yap sonra geç. ve dosyayı oluştur kodu
  }

  let uploadedImage = req.files.image;
  let uploadPath = __dirname + '/public/uploads/' + uploadedImage.name; // görselleri atmak için public'in içinde uploads klasörü oluşturacağız bunun için yol tanımladık uploads klasörüne.

  uploadedImage.mv(uploadPath, async () => {
    await Photo.create({
      ...req.body, // req.body'nin hepisini al (name ve description geliyor burdan)
      image: '/uploads/' + uploadedImage.name, //bir de image bilgisi ekle
    });
    res.redirect('/');
  }); // bu fonksiyon resmi al move et. 1.parametre yol, ikinci parametre veritabanına bilginin gitmesi.
});
app.get('/photos/edit/:id', async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  res.render('edit', {
    photo,
  });
});
app.put('/photos/:id', async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  photo.title = req.body.title;
  photo.description = req.body.description;
  photo.save(); //photoyu kaydettik
  res.redirect(`/photos/${req.params.id}`)
});

const port = 3000;

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı...`);
});
