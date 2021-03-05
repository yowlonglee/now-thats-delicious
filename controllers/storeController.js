const mongoose = require ('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  // Save photo into memory, resize it, and let multer uploads it
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      // When passing null as the first value and a second value into the callback function, 
      // that means it worked and the second value is the one will be passed along
      next(null, true);
    } else {
      // When calling a callback function and pass something as the first value,
      // that means it is an error
      next({message: 'That filetype isn\'t allowed!'}, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to our filesystem, keep going!
  next();
};

exports.createStore = async (req, res) => {
  // save new store to MongoDB
  const store = await (new Store(req.body)).save();
  // show a success flash message
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
  // redirect to the new store page
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // 1. Query the database for a list of all stores
  const stores = await Store.find();
  res.render('stores', {title: 'Stores', stores});
};

exports.editStore = async (req, res) => {
  // 1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id });
  // 2. Confirm they are the owner of the store
  // 3. Render out the edit form so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // Set the location data to be a point
  req.body.location.type = 'Point';
  // Find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old one, else the function will return the old data by default
    runValidators: true // run the store schema validators
  }).exec();
  // Redirect them to the store and tell them it worked
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store →</a>`);
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  // 1. Find the store given the slug
  const store = await Store.findOne({ slug: req.params.slug });
  // MongoDB will return null if it can't find the query
  // So we call next to call the "notFound" middleware
  if(!store) {
    return next();
  }
  // 2. Render out the store
  res.render('store', { store, title: store.name });
  // res.json(store);
};

exports.getStoresByTag = async (req, res) => {
  // get a list of all stores by making our Store custom static method
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tag', { tags, title: 'Tags', tag, stores });
};