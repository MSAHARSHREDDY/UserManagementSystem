const express=require("express")
const multer=require("multer")
const {verifyToken}=require("../middleware/auth")
const path=require("path")
const { adminRegister, verifyOtp, forgotPassword, resetPassword, adminLogin, getUserData, addNewUser, editUserInfo, deleteUser } = require("../controllers/adminController")
const adminRouter=express.Router()


/*-----------------refer to stubborn developers for file upload---------*/
//diskStorage is used to store files in the system
const storage=multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,"./public/adminImages")
    },
    filename:function(req,file,callback)
    {
        console.log(file)
        callback(null,file.fieldname+"-"+Date.now()+path.extname(file.originalname))
      
    }
})
const upload=multer({storage:storage})

adminRouter.post("/adminRegister", upload.single("image"), adminRegister)
adminRouter.post("/adminOtpVerify",verifyOtp)
adminRouter.post("/adminForgotPassword",forgotPassword)
adminRouter.post("/resetPassword",resetPassword)
adminRouter.post("/adminLogin",adminLogin)
adminRouter.get("/userData",getUserData)
adminRouter.post("/addNewUser",upload.single("image"),addNewUser)
adminRouter.post("/editUserData",verifyToken,editUserInfo)
adminRouter.post("/deleteUser",verifyToken,deleteUser)

module.exports={adminRouter}