
const { userModel } = require("../models/userModel")
const { sendMailToUser } = require("../config/emailSend")
const { verificationOtp } = require("../config/verifyotp")
//const {otpGeneration}=require("../config/otp")
const { forgotPasswordLink } = require("../config/forgotPassword")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const randomString = require("randomstring")
const otpGenerator=require("otp-generator")


//Registration
const userRegister = async (req, res) => {
    try {
        const email = req.body.email
        const userEmail = await userModel.findOne({ email: email })
        if (userEmail) {
            res.send({ "status": "400", "message": "email already exists" })
        }
        else {
            const hashPassword = await bcrypt.hash(req.body.password, 10)
            const newOTP=otpGenerator.generate(6,{
                digits:true,upperCaseAlphabets:false,specialChars:false,lowerCaseAlphabets:false
            })
            //var newOTP = await otpGeneration();
            const doc = new userModel({
                name: req.body.name,
                email: req.body.email,
                password: hashPassword,
                image: req.file.filename,
                mobile: req.body.mobile,
                otp:newOTP
            })
            const userData = await doc.save()
            console.log(userData)
            res.send({ "status": "200", "message": "success", data: userData })
            // if(userData)
            // {
            sendMailToUser(req.body.name, req.body.email, userData.otp)
            //     res.render("register.ejs",{message:"your registration successfull,Please verify your mail"})
            // }
            // else
            // {
            //     res.render("register.ejs",{message:"your registration failed"})
            // }

        }
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err.message)
    }
}

//loginPost
const userLogin = async (req, res) => {
    try {
        const userEmail = req.body.email
        const userPassword = req.body.password

        const userData = await userModel.findOne({ email: userEmail })
        console.log(userData)
        if (userData != null) {
            const isMatch = await bcrypt.compare(userPassword, userData.password)
            if (isMatch) {
                if (userData.otpVerified === false) {
                    res.send({ "status": "400", "message": "first please verify your otp" })
                    //res.render("login.ejs",{message:"Please verify your email"})
                }
                else {
                    const accesstokenData = await userData.generateAccessToken()
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

const verifyOtp = async (req, res) => {
    try {
        const userOtp = req.body.otp
        const userEmail = req.body.email
        const tokenData = await userModel.findOne({ email: userEmail, otp: userOtp })


        if (tokenData != null) {
            const userData = await userModel.findByIdAndUpdate({ _id: tokenData._id }, { $set: { otpVerified: true } })
            console.log(userData)
            if (userData) {
                res.send({ "status": "200", "message": "otp verified" })
                verificationOtp(userData.name, userData.email)
            }
            else {
                res.send({ "status": "400", "message": "You have entered wrong otp" })
            }
        }
        else {

            res.send({ "status": "400", "message": "You are not a registered user or might be otp wrong" })
        }
    }
    catch (err) {
        console.log(err)
    }
}

const forgotPassword = async (req, res) => {
    try {
        const userEmail = req.body.email
        const userData = await userModel.findOne({ email: userEmail })
        console.log(userData)
        if (userData) {
            const randomStringValue = randomString.generate()
            const data = await userModel.updateOne({ email: userEmail }, { $set: { randomToken: randomStringValue } })//Here random token is taken from model
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
        const tokenData = await userModel.findOne({ randomToken: token })
        if (tokenData) {
            const hashPassword = await bcrypt.hash(req.body.password, 10)
            const userData = await userModel.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: hashPassword, randomToken: "" } }, { new: true }) //{new: true} display the updated data in postman
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

const userProfile = async (req, res) => {
    try {
        const userId = req.query.id
        const userData = await userModel.findOne({ _id: userId })
        console.log(userData)
        if (userData) {
            const userObject =
            {
                id: userData._id,
                Name: userData.name,
                Email: userData.email,
                Mobile: userData.mobile,
                Image: userData.image
            }
            res.send({ "status": "200", data: userObject })
        }
        else {
            res.send({ "status": "400", "message": "Invalid user Id" })
        }
    }
    catch (err) {
        console.log(err)
        res.send({ "status": "400", "message": err.message })
    }
}

const updateProfile = async (req, res) => {
    try {
        const userId = req.body.id
        const userName = req.body.name
        const userEmail = req.body.email
        const userMobile = req.body.mobile
        const userImage = req.file.filename
        const data = await userModel.findByIdAndUpdate({ _id:userId  }, { $set: { name: userName, email: userEmail, mobile: userMobile,image:userImage} },{ new: true })
        //{new: true} display the updated data in postman
        console.log(data)
        if (data) {
            res.send({ "status": "200", "message": "profile updated successfully",Info:data })
        }

        else {
            res.send({ "status": "400", "message": "userId doesnot exists" })
        }

    } catch (error) {
        console.log(error)
        res.send({"status":"400","message":error.message})
    }
}


module.exports = { userRegister, userLogin, verifyOtp, forgotPassword, resetPassword, userProfile, updateProfile } 