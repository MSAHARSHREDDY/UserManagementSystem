const nodemailer=require("nodemailer")
const randomString=require("randomstring")
const forgotPasswordLink=async(name,email,token)=>
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
            subject:"Forgot Password",
            html:'<p> Hii '+name+' Please copy the link and <a href="http://localhost:3000/resetPassword?token='+token+'"> reset your password </a>'

        }
        transporter.sendMail(mailOptions,(error,info)=>
        {
            if(error)
            {
                console.log(error)
            }
            else
            {
                console.log("forgot password link has been sent ",info.response)
            }
        })

    }
    catch(err)
    {
        console.log(err)
    }
}


module.exports={forgotPasswordLink}