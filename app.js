const dotenv=require("dotenv")
dotenv.config()
const express=require("express")
const connectDB=require("./db/connectDB")
const { adminRouter } = require("./routes/adminRoutes")
const {userRouter}=require("./routes/userRoutes")
const app=express()
const port=process.env.port

connectDB()

app.set("view-engine","ejs")
app.set("views","./views/users")

//middleware
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//user Routes
app.use("/",userRouter)

//admin routes
app.use("/",adminRouter)

app.listen(port,()=>{
    console.log("listening on port "+port)
})

