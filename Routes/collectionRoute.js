const express = require("express");
const router = express.Router();
const CollectionController = require("../Controllers/collectionController");

router.post('/create', CollectionController.createCollection);
router.get('/list', CollectionController.getAllCollections);
router.put('/update/:id', CollectionController.updateCollection);
router.delete('/delete/:id', CollectionController.deleteCollection);
router.get('/get/collection/name', CollectionController.getCollectionName);
router.get('/home/get/collection', CollectionController.getAllCollectionWithCount);
router.get('/get/recommeded/products', CollectionController.getRecommendedData)

module.exports = router;