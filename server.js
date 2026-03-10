require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
const path = require("path")
const twilio = require("twilio")

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname,"public")))

/* ---------------- MONGODB CONNECTION ---------------- */

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))

/* ---------------- DATABASE MODELS ---------------- */

const User = mongoose.model("User",{
username:String,
password:String
})

const Report = mongoose.model("Report",{
name:String,
phone:String,
age:Number,
disease:String,
location:String,
date:String,
lat:Number,
lng:Number
})

/* ---------------- TWILIO SETUP ---------------- */

const client = twilio(
process.env.TWILIO_SID,
process.env.TWILIO_AUTH
)

/* ---------------- HOME PAGE ---------------- */

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"))
})

/* ---------------- SIGNUP ---------------- */

app.post("/signup",async(req,res)=>{

const user = new User(req.body)

await user.save()

res.json({status:true})

})

/* ---------------- LOGIN ---------------- */

app.post("/login",async(req,res)=>{

const {username,password} = req.body

/* ADMIN LOGIN */

if(username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS){

return res.json({
status:true,
role:"admin"
})

}

/* NORMAL USER LOGIN */

const user = await User.findOne({username,password})

if(user){

res.json({
status:true,
role:"user"
})

}else{

res.json({status:false})

}

})

/* ---------------- REPORT DISEASE ---------------- */

app.post("/report", async (req,res)=>{

try{

const report = new Report(req.body)

await report.save()

let mapsLink = `https://www.google.com/maps?q=${req.body.lat},${req.body.lng}`

await client.messages.create({

body:`🚨 Disease Report Alert

Name: ${req.body.name}
Phone: ${req.body.phone}
Disease: ${req.body.disease}
Location: ${req.body.location}

📍 GPS:
${mapsLink}

Date: ${req.body.date}`,

from: process.env.TWILIO_NUMBER,
to: process.env.ADMIN_PHONE

})

res.json({status:"Report Submitted Successfully"})

}catch(err){

console.log(err)

res.json({status:"Error sending report"})

}

})

/* ---------------- GET REPORTS ---------------- */

app.get("/reports",async(req,res)=>{

const data = await Report.find()

res.json(data)

})

/* ---------------- ANALYTICS ---------------- */

app.get("/analytics",async(req,res)=>{

const data = await Report.aggregate([
{$group:{_id:"$disease",count:{$sum:1}}}
])

res.json(data)

})

/* ---------------- DELETE REPORT ---------------- */

app.delete("/deleteReport/:id", async (req,res)=>{

try{

await Report.findByIdAndDelete(req.params.id)

res.json({status:true})

}catch{

res.json({status:false})

}

})

/* ---------------- BULK DELETE ---------------- */

app.post("/bulkDelete", async (req,res)=>{

try{

const ids = req.body.ids

await Report.deleteMany({_id:{$in:ids}})

res.json({status:true})

}catch{

res.json({status:false})

}

})

/* ---------------- DOWNLOAD CSV ---------------- */

app.get("/download", async (req,res)=>{

const reports = await Report.find()

let csv = "Name,Phone,Age,Disease,Location,Date,Map Link\n"

reports.forEach(r=>{

const mapLink=`https://www.google.com/maps?q=${r.lat},${r.lng}`

csv += `${r.name},${r.phone},${r.age},${r.disease},${r.location},${r.date},${mapLink}\n`

})

res.header("Content-Type","text/csv")

res.attachment("reports.csv")

return res.send(csv)

})

/* ---------------- MAP PAGE ---------------- */

app.get("/admin-map",(req,res)=>{
res.sendFile(path.join(__dirname,"public","map.html"))
})

/* ---------------- SERVER START ---------------- */

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
console.log(`Server running on port ${PORT}`)
})