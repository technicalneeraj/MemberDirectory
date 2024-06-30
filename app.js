require("dotenv").config();
require("./db/conn");
const express=require("express");
const cors=require("cors");
const app=express();
const PORT=process.env.PORT ||6010;
const router=require("./routes/router");

app.use(cors());
app.use(express.json());
app.use("/uploads",express.static("./uploads"));  // matlab jab bhi uploads wala route par koi call kre toh wo same directory ka uploads ko dekhe
app.use(router);
app.use("/files",express.static("./public/files"));

app.get("/",(req,res)=>{
    res.send("hey");
});

app.listen(PORT,()=>{
    console.log("App is listening");
});

