const jwt=require("jsonwebtoken")
const verifyToken=async(req,res,next)=>
{
    const token=req.body.token || req.query.token|| req.headers["authorization"]
    if(token)
    {
       //verify method is used to verify token
       jwt.verify(token,process.env.accessTokenSecretKey, (err,decodedToken)=>{
        if(!err)
        {
            console.log(decodedToken)
            next() 
        }
        else
        {
            res.send({"status":"404","message":"Token is Invalid token has expired"})
        }
        })
    }
    else
    {
        res.send({"status":"404","message":"Token is required"})
    }
}
module.exports={verifyToken}
