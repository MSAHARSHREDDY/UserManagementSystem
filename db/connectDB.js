const mongoose=require("mongoose")
mongoose.set('strictQuery', false);
const connectDB=async()=>
{
    try {
        await mongoose.connect(process.env.uri,{
            dbName:process.env.dbName
        })
        console.log("connected to the db")
    } catch (error) {
        console.log("failed to connect")
    }
}
module.exports=connectDB