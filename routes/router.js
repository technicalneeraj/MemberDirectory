const express = require("express");
const router = new express.Router();
const controller = require("../controllers/userController");
const upload = require("../multerconfig/storageconfig");

router.post("/user/register", upload.single("user_profile"), controller.userRegistering);
router.get("/user/details",controller.userDetails);
router.get("/user/:id",controller.getSingleUser);
router.put("/user/edit/:id",upload.single("user_profile"), controller.userUpdating);
router.delete("/user/delete/:id",controller.userDelete);
router.put("/user/status/:id",controller.statusUpdate);
router.get("/exportuser",controller.exporting);

module.exports = router;
