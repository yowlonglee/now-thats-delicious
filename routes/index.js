const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStores));
// go to the 'stores' page
router.get('/stores', catchErrors(storeController.getStores));
// go to the 'add' page, a blank form for creating a store
router.get('/add', storeController.addStore);
// after submit a new store
router.post('/add', 
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
// update store info
router.post('/add/:id', 
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);
// edit an existing store
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

module.exports = router;
