const Photo = require('../models/Photo');
const fs = require('fs'); // dosya işlemleri için

exports.getAllPhotos = async (req, res) => {
  const photos = await Photo.find({}).sort('-dateCreated'); // başa eksi koyunca tersten sıraladı
  res.render('index', {
    photos, // bu aynı zamanda photos: photos komutudur veritabanından aldık photo verilerini index.ejs ye yolladık
  });
};

exports.getPhoto = async (req, res) => {
  // console.log(req.params.id) // yakaladığımız id'yi log ile ekrana yazdırdık
  const photo = await Photo.findById(req.params.id); // burdaki fotoğraf bilgisini alana kadar beklemek istiyorum o yüzden await
  res.render('photo', {
    photo,
  });
};

exports.createPhoto = async (req, res) => {
  //console.log(req.files.image);// burdaki image formumuzda file labelimizin
  /* await Photo.create(req.body);
  res.redirect('/'); */

  const uploadDir = 'public/uploads';
  if (!fs.existsSync(uploadDir)) {
    // eğer uploadDir yoksa(oluşmamışsa)
    fs.mkdirSync(uploadDir); // sync fonksiyon önce bunu yap sonra geç. ve dosyayı oluştur kodu
  }

  let uploadedImage = req.files.image;
  let uploadPath = __dirname + '/../public/uploads/' + uploadedImage.name; // görselleri atmak için public'in içinde uploads klasörü oluşturacağız bunun için yol tanımladık uploads klasörüne.

  uploadedImage.mv(uploadPath, async () => {
    await Photo.create({
      ...req.body, // req.body'nin hepisini al (name ve description geliyor burdan)
      image: '/uploads/' + uploadedImage.name, //bir de image bilgisi ekle
    });
    res.redirect('/');
  }); // bu fonksiyon resmi al move et. 1.parametre yol, ikinci parametre veritabanına bilginin gitmesi.
};

exports.updatePhoto = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  photo.title = req.body.title;
  photo.description = req.body.description;
  photo.save(); //photoyu kaydettik
  res.redirect(`/photos/${req.params.id}`);
};

exports.deletePhoto = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  let deletedImage = __dirname + '/../public' + photo.image;
  fs.unlinkSync(deletedImage);
  await Photo.findByIdAndRemove(req.params.id);
  res.redirect('/');
};
