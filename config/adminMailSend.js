const nodemailer=require("nodemailer")
const sendMailToUserByAdmin=async(name,email,password)=>
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
            subject:"Admin added you ",
            html:'<p> Hii '+name+' Your email is <br>Email:-'+email+' <br>Password:-'+password+'</p>',

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
}



module.exports={sendMailToUserByAdmin}