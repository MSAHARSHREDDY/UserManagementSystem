const nodemailer=require("nodemailer")
const sendMailToUser=async(name,email,otp)=>
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
            subject:"For Verification mail",
            html:'<p> Hii '+name+' And your otp is <h2>'+otp+'</h2></p>',

        }
        transporter.sendMail(mailOptions,(error,info)=>
        {
            if(error)
            {
                console.log(error)
            }
            else
            {
                console.log("email has been sent ",info.response)
            }
        })

    }
    catch(err)
    {
        console.log(err)
    }
    return sendMailToUser
}



module.exports={sendMailToUser}