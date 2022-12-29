const nodemailer=require("nodemailer")
const verificationOtp=async(name,email)=>
{
    try
    {
      const transporter= nodemailer.createTransport({
            host:"smtp.gmail.com",
            port:587,
            secure:false,
            requireTLS:true,
            auth:
            {
               user:process.env.emailUser,
               pass:process.env.emailPassword
            }
        })

        const mailOptions=
        {
            from:process.env.emailUser,
            to:email,
            subject:"Successfully Verified OTP",
            html:`<h3> Hi ${name}, </h3> <p> Your OTP has been verified successfull </p>.`
        }

        transporter.sendMail(mailOptions,(error,info)=>
        {
            if(error)
            {
                console.log(error)
            }
            else
            {
                console.log("otp has been verified successfully ",info.response)
            }
        })
    }
    catch(err)
    {
        console.log(err)
    }
}
module.exports={verificationOtp}