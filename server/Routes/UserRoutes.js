const router = require("express").Router();
const UserController = require("../Controllers/UserController");
const Authentication = require("../Helper/Helper");

router.post("/signup", UserController.SignUp);
router.post("/signin", UserController.SignIn);
router.post("/forgetpassword", UserController.ForgetPassword);
router.post("/resetpassword", UserController.ResetPassword);
router.post("/update", Authentication, UserController.updateProfile);
router.get("/:id", Authentication, UserController.getProfile);
router.post("/upload/:id", Authentication, UserController.uploadPhoto);
router.get("/photos/:id", Authentication, UserController.getSpecificUserPhoto);
router.get("/all_photos/:id", Authentication, UserController.getAllPhotos);
router.post("/title", Authentication, UserController.searchByTitle);
router.post("/catagory", Authentication, UserController.searchImageByCatagory);

router.delete(
  "/delete/:photoId/:userId",
  Authentication,
  UserController.deletePhoto
);

module.exports = router;
