const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const userSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true,
    },
    email:
    {
        type: String,
        required: true,
    },
    mobile:
    {
        type: Number,
        required: true,
    },
    image:
    {
        type: String,
        required: true
    },
    password:
    {
        type: String,
        required: true,
    },
    isAdmin:
    {
        type: Boolean,
        default: false
    },

    otp:{type: Number,
        default:null
    },


    createdAt:
    {
        type: Date,
        default: Date.now,

    },
    otpVerified:
    {
        type: Boolean,
        default: false
    },
    randomToken:
    {
        type:String,
        default:""
    },
    tokensValue:
        [
            {
                token: {
                    type: String,
                    default: ""
                }
            }
        ]



})

//Token generation
//we are generating access token refer to thapa Technical[mern stack video 15]
userSchema.methods.generateAccessToken = async function () {
    try {
        let MyToken = jwt.sign({ _id: this._id }, process.env.accessTokenSecretKey, { expiresIn: "24h" })
        this.tokensValue = this.tokensValue.concat({ token: MyToken })

        await this.save()
        return MyToken
    } catch (error) {
        console.log(err)
    }
}

const userModel = mongoose.model("user", userSchema)
module.exports = { userModel }


