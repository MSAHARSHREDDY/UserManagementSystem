const { adminModel } = require("../models/adminModel")
const bcrypt = require("bcrypt")
const { sendMailToUser } = require("../config/emailSend")
const { sendMailToUserByAdmin } = require("../config/adminMailSend")
const { verificationOtp } = require("../config/verifyotp")
const { forgotPasswordLink } = require("../config/forgotPassword")
const randomString = require("randomstring")
const { getUserInfo } = require("../controllers/userController")
const { userModel } = require("../models/userModel")
const otpGenerator=require("otp-generator")


const adminRegister = async (req, res) => {
    try {
        const userEmail = req.body.email
        const userData = await adminModel.findOne({ email: userEmail })
        if (userData) {
            res.send({ "status": "400", "message": "email already exists" })
        }
        else {
            const hashPassword = await bcrypt.hash(req.body.password, 10)
            const newOTP=otpGenerator.generate(6,{
                digits:true,upperCaseAlphabets:false,specialChars:false,lowerCaseAlphabets:false
            })
            const doc = new adminModel({
                name: req.body.name,
                email: req.body.email,
                password: hashPassword,
                image: req.file.filename,
                mobile: req.body.mobile,
                otp:newOTP
            })
            const result = await doc.save()
            console.log(result)
            res.send({ "status": "200", "message": "success", data: result })
            sendMailToUser(result.name, result.email, result.otp)
        }
    }
    catch (err) {
        console.log(err)
        res.send({ "status": "400", "message": "failed to register" })
    }
}

const verifyOtp = async (req, res) => {
    try {
        const userEmail = req.body.email
        const userOtp = req.body.otp
        const emailVerify = await adminModel.findOne({ email: userEmail, otp: userOtp })
        if (emailVerify != null) {
            const userData = await adminModel.findByIdAndUpdate({ _id: emailVerify._id }, { $set: { otpVerified: true, isAdmin: true } })
            if (userData) {
                res.send({ "status": "200", "message": "otp verified" })
                verificationOtp(userData.name, userData.email)
            }
            else {
                res.send({ "status": "400", "message": "You have entered wrong otp" })
            }
        }
        else {
            res.send({ "status": "400", "message": "You are not a registered user or moght be otp wrong" })
        }
    }
    catch (err) {

        console.log(err)
    }
}

const forgotPassword = async (req, res) => {
    try {
        const userEmail = req.body.email
        const userData = await adminModel.findOne({ email: userEmail })
        console.log(userData)
        if (userData) {
            const randomStringValue = randomString.generate()
            const data = await adminModel.updateOne({ email: userEmail }, { $set: { randomToken: randomStringValue } })//Here random token is taken from model
            forgotPasswordLink(userData.name, userData.email, randomStringValue)
            res.send({ "status": "200", "message": "please check your email and reset your password" })
        }
        else {
            res.send({ "status": "400", "message": "This email doesnot exist" })
        }
    }
    catch (err) {
        console.log(err)
        res.send({ "status": "400", "message": err.message })
    }
}

const resetPassword = async (req, res) => {
    try {
        const token = req.query.token
        const tokenData = await adminModel.findOne({ randomToken: token })
        if (tokenData) {
            const hashPassword = await bcrypt.hash(req.body.password, 10)
            const userData = await adminModel.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: hashPassword, randomToken: "" } }, { new: true })
            res.send({ "status": "200", "message": "successfully changed your password", data: userData })
        }
        else {
            res.send({ "status": "400", "message": "This link has been expired" })
        }
    } catch (error) {
        console.log(error)
        res.send({ "status": "400", "message": error.message })
    }
}

//loginPost
const adminLogin = async (req, res) => {
    try {
        const userEmail = req.body.email
        const userPassword = req.body.password

        const userData = await adminModel.findOne({ email: userEmail })
        console.log(userData)
        if (userData != null) {
            const isMatch = await bcrypt.compare(userPassword, userData.password)
            if (isMatch) {
                if (userData.otpVerified === false) {
                    res.send({ "status": "400", "message": "first please verify your otp" })
                    //res.render("login.ejs",{message:"Please verify your email"})
                }
                else {
                    const accesstokenData = await userData.generateAdminToken()
                    console.log(accesstokenData)
                    const userResult =
                    {
                        userName: userData.name,
                        userEmail: userData.email,
                        Token: accesstokenData
                    }
                    res.send({ "status": "200", "message": "success", data: userResult })
                    //res.redirect("/home")
                }
            }
            else {
                res.send({ "status": "400", "message": "Please enter valid password" })
                //res.render("login.ejs",{message:"Incorrect Email and Password"})
            }
        }
        else {
            res.send({ "status": "400", "message": "Your are not a registered user" })
            //res.render("login.ejs",{message:"Your not a registered user"})
        }

    }
    catch (err) {
        console.log(err)
    }
}

const getUserData = async (req, res) => {
    try {
        const userData = await userModel.find()
        console.log(userData)
        if (userData) {
            res.send({ "status": "200", data: userData })
        }
        else {
            res.send({ "status": "400", "message": "failed to fetch data" })
        }
    }
    catch (err) {
        console.log(err)
        res.send({ "status": "400", "message": err.message })
    }
}

const addNewUser = async (req, res) => {
    try {
        const userEmail = req.body.email
        const result = await userModel.findOne({ email: userEmail })
        if (result) {
            res.send({ "status": "400", "message": "email already exists" })
        }
        else {
            const randomPassword = randomString.generate(8)
            const hashPassword = await bcrypt.hash(randomPassword, 10)
            const doc = await userModel({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                image: req.file.filename,
                password: randomPassword
            })
            const userData = await doc.save()
            console.log(userData)
            res.send({ "status": "200", "message": "success", data: userData })
            sendMailToUserByAdmin(userData.name, userData.email, userData.password)
        }

    } catch (error) {
        console.log(error)
        res.send({ "status": "400", "message": error.message })
    }
}

const editUserInfo = async (req, res) => {
    try {
        const userId = req.query.id
        const userName=req.body.name
        const userEmail=req.body.email
        const userMobile=req.body.mobile
        const userData = await userModel.findByIdAndUpdate({ _id: userId },{$set:{name:userName,email:userEmail,mobile:userMobile}}, { new: true })
        if (userData) {
            res.send({ "status": "400", "message": "success", data: userData })
        }
        else {
            res.send({ "status": "400", "message": "Id doesnot exists" })
        }
    }
    catch (err) {
        console.log(err)
        res.send({ "status": "400", "message": err.message })
    }
}

const deleteUser=async(req,res)=>
{
    try {
        const userId=req.query.id
        const userData=await userModel.findByIdAndDelete({_id:userId})
        if(userData)
        {
            res.send({"status":"200","message":"successfully deleted"})
        }
        else
        {
            res.send({"status":"400","message":"Id doesnot exist"})
        }
    } catch (error) {
        console.log(error)
        res.send({"status":"400","message":error.message})
    }
}

module.exports = { adminRegister, verifyOtp, forgotPassword, resetPassword, adminLogin, getUserData, addNewUser, editUserInfo,deleteUser }