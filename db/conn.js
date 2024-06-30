const mongoose=require("mongoose");

const db=process.env.DB_URL;

mongoose.connect(db,{
    useUnifiedTopology:true,
    useNewUrlParser:true,
}).then(()=>console.log("database connected")).catch((err)=>{
    console.log(err)
});