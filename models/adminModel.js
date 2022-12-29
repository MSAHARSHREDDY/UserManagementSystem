const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const adminSchema = new mongoose.Schema({
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

    otp: {
        type: Number,
        default:null
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
        ],
        createdAt:
    {
        type: Date,
        default: Date.now,

    }
})

//Token generation
//we are generating access token refer to thapa Technical[mern stack video 15]
adminSchema.methods.generateAdminToken = async function () {
    try {
        let MyToken = jwt.sign({ _id: this._id }, process.env.accessTokenSecretKey, { expiresIn: "24h" })
        this.tokensValue = this.tokensValue.concat({ token: MyToken })

        await this.save()
        return MyToken
    } catch (error) {
        console.log(err)
    }
}

const adminModel = mongoose.model("admin", adminSchema)
module.exports = { adminModel }


