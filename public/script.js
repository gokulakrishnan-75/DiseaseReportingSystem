const API = window.location.origin

/* ---------------- SIGNUP ---------------- */
async function signup(){

const username = document.getElementById("username").value.trim()
const password = document.getElementById("password").value.trim()

if(!username || !password){
return alert("Enter all fields")
}

const res = await fetch(API + "/signup",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({username,password})
})

const data = await res.json()

if(data.status){
alert("✅ Signup Successful")
window.location="login.html"
}else{
alert("❌ Signup Failed")
}

}

/* ---------------- LOGIN ---------------- */
async function login(){

const username = document.getElementById("username").value.trim()
const password = document.getElementById("password").value.trim()

if(!username || !password){
return alert("Enter credentials")
}

const res = await fetch(API + "/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({username,password})
})

const data = await res.json()

if(data.status){

if(data.role==="admin"){
window.location="admin_dashboard.html"
}else{
window.location="user_dashboard.html"
}

}else{
alert("❌ Invalid login")
}

}

/* ---------------- REPORT ---------------- */
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

let res = await fetch(API + "/report",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
})

let result = await res.json()

if(result.status){

if(result.smsSent){
alert("✅ Report Submitted & SMS Sent")
}else{
alert("⚠ Report saved but SMS failed")
}

}else{
alert("❌ Error submitting report")
}

}

/* ---------------- LOAD REPORTS ---------------- */
async function loadReports(){

let res = await fetch(API + "/reports")
let data = await res.json()

let table = document.getElementById("reports")
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
<td>
${r.location}<br>
<a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank">📍 Map</a>
</td>
<td>${r.date}</td>
<td><button onclick="deleteReport('${r._id}')">Delete</button></td>
</tr>`
})

}

/* ---------------- DELETE ---------------- */
async function deleteReport(id){
if(confirm("Delete?")){
await fetch(API + "/deleteReport/"+id,{method:"DELETE"})
loadReports()
}
}

/* ---------------- BULK DELETE ---------------- */
async function deleteSelected(){

let ids=[]

document.querySelectorAll(".selectReport:checked")
.forEach(cb=>ids.push(cb.value))

await fetch(API + "/bulkDelete",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({ids})
})

alert("Deleted")
loadReports()

}

/* ---------------- DOWNLOAD ---------------- */
function downloadReports(){
window.location = API + "/download"
}

/* ---------------- ANALYTICS ---------------- */
async function loadAnalytics(){

let res = await fetch(API + "/analytics")
let data = await res.json()

new Chart(document.getElementById("chart"),{
type:"bar",
data:{
labels:data.map(d=>d._id),
datasets:[{
label:"Cases",
data:data.map(d=>d.count)
}]
}
})

}

/* ---------------- HEATMAP ---------------- */
async function loadHeatmap(){

let res = await fetch(API + "/reports")
let reports = await res.json()

let map = L.map('map').setView([20.5937,78.9629],5)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

let points=[]

reports.forEach(r=>{
if(r.lat && r.lng){
points.push([r.lat,r.lng,0.5])
}
})

L.heatLayer(points).addTo(map)

}

/* ---------------- GPS ---------------- */
if(navigator.geolocation){
navigator.geolocation.getCurrentPosition(pos=>{
if(document.getElementById("lat")){
document.getElementById("lat").value = pos.coords.latitude
document.getElementById("lng").value = pos.coords.longitude
}
})
}

/* ---------------- LOAD ---------------- */
window.onload=function(){

loadReports()

if(document.getElementById("map")){
loadHeatmap()
}

}