const API = window.location.origin

let chartInstance = null
let mapInstance = null

/* SIGNUP */
async function signup(){

const username = document.getElementById("username").value
const password = document.getElementById("password").value

try{
const res = await fetch(API + "/signup",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({username,password})
})

const data = await res.json()

if(data.status){
alert("Signup Successful")
window.location="login.html"
}else{
alert("Signup Failed")
}
}catch(err){
alert("Server error")
}

}

/* LOGIN */
async function login(){

const username = document.getElementById("username").value
const password = document.getElementById("password").value

try{
const res = await fetch(API + "/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({username,password})
})

const data = await res.json()

if(data.status){
window.location = data.role==="admin" ? "admin_dashboard.html" : "user_dashboard.html"
}else{
alert("Invalid login")
}
}catch(err){
alert("Server error")
}

}

/* REPORT */
async function reportDisease(){

let data = {
name: document.getElementById("name").value,
age: document.getElementById("age").value,
phone: document.getElementById("phone").value,
disease: document.getElementById("disease").value,
location: document.getElementById("location").value,
date: document.getElementById("date").value,
lat: document.getElementById("lat").value,
lng: document.getElementById("lng").value
}

try{
let res = await fetch("/report",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
})

let result = await res.json()

alert(result.status ? "Report Submitted" : "Error submitting")
}catch(err){
alert("Server error")
}

}

/* LOAD REPORTS */
async function loadReports(){

let res = await fetch("/reports")
let data = await res.json()

let table = document.getElementById("reportTable") // ✅ FIXED

if(!table) return

table.innerHTML=""

data.forEach(r=>{

table.innerHTML += `
<tr>
<td><input type="checkbox" class="selectReport" value="${r._id}"></td>
<td>${r.name}</td>
<td>${r.age}</td>
<td>${r.phone}</td>
<td>${r.disease}</td>
<td>${r.location}</td>
<td>${r.date}</td>
<td><button onclick="deleteReport('${r._id}')">Delete</button></td>
</tr>
`
})

}

/* DELETE */
async function deleteReport(id){

if(confirm("Delete this report?")){
await fetch("/deleteReport/"+id,{method:"DELETE"})
loadReports()
}

}

/* BULK DELETE */
async function deleteSelected(){

let checkboxes = document.querySelectorAll(".selectReport:checked")

if(checkboxes.length===0){
alert("Select reports first")
return
}

let ids=[]
checkboxes.forEach(cb=>ids.push(cb.value))

await fetch("/bulkDelete",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({ids})
})

alert("Deleted successfully")
loadReports()

}

/* DOWNLOAD */
function downloadReports(){
window.location="/download"
}

/* ANALYTICS */
async function loadAnalytics(){

let res = await fetch("/analytics")
let data = await res.json()

let labels = data.map(d=>d._id)
let values = data.map(d=>d.count)

/* FIX: destroy old chart */
if(chartInstance){
chartInstance.destroy()
}

chartInstance = new Chart(document.getElementById("chart"),{
type:"bar",
data:{
labels:labels,
datasets:[{
label:"Disease Reports",
data:values
}]
}
})

}

/* HEATMAP */
async function loadHeatmap(){

let res = await fetch("/reports")
let reports = await res.json()

/* FIX: remove old map */
if(mapInstance){
mapInstance.remove()
}

mapInstance = L.map('map').setView([20.5937,78.9629],5)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance)

let heatPoints=[]

reports.forEach(r=>{
if(r.lat && r.lng){
heatPoints.push([
parseFloat(r.lat),   // ✅ FIXED
parseFloat(r.lng),
0.5
])
}
})

if(heatPoints.length>0){
L.heatLayer(heatPoints,{
radius:25,
blur:15
}).addTo(mapInstance)
}

}

/* GPS */
if(navigator.geolocation){
navigator.geolocation.getCurrentPosition(function(position){

let latField = document.getElementById("lat")
let lngField = document.getElementById("lng")

if(latField && lngField){
latField.value = position.coords.latitude
lngField.value = position.coords.longitude
}

})
}

/* PAGE LOAD */
window.onload=function(){
loadReports()
}