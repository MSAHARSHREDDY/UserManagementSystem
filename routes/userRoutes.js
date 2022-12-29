const express=require("express")
const multer=require("multer")
const {verifyToken}=require("../middleware/auth")
const path=require("path")
const {verifyOtp, forgotPassword, resetPassword, userRegister, userLogin, userProfile, updateProfile } = require("../controllers/userController")
const userRouter=express.Router()


/*-----------------refer to stubborn developers for file upload---------*/
//diskStorage is used to store files in the system
const storage=multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,"./public/userImages")
    },
    filename:function(req,file,callback)
    {
        console.log(file)
        callback(null,file.fieldname+"-"+Date.now()+path.extname(file.originalname))
      
    }
})
const upload=multer({storage:storage})
/*-----------------refer to stubborn developers for file upload---------*/ 


userRouter.post("/userRegister", upload.single("image"), userRegister)
userRouter.post("/userLogin",userLogin)
userRouter.post("/userOtpVerify",verifyOtp)
userRouter.post("/userForgotPassword",forgotPassword)
userRouter.post("/resetPassword",resetPassword)
userRouter.get("/userProfile",verifyToken,userProfile)
userRouter.post("/updateProfile",verifyToken,upload.single("image"),updateProfile)
module.exports={userRouter}