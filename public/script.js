/* ================= API URL ================= */

const API = window.location.origin

/* ================= SIGNUP ================= */

async function signup(){

const username = document.getElementById("username").value
const password = document.getElementById("password").value

const res = await fetch(API + "/signup",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
username,
password
})
})

const data = await res.json()

if(data.status){
alert("Signup successful")
window.location="login.html"
}
else{
alert(data.message || "Signup failed")
}

}

/* ================= LOGIN ================= */

async function login(){

const username = document.getElementById("username").value
const password = document.getElementById("password").value

const res = await fetch(API + "/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
username,
password
})
})

const data = await res.json()

if(data.status){

if(data.role==="admin"){
window.location="admin_dashboard.html"
}

else{
window.location="user_dashboard.html"
}

}

else{
alert("Invalid Login")
}

}

/* ================= REPORT DISEASE ================= */

async function submitReport(){

navigator.geolocation.getCurrentPosition(async pos=>{

const lat = pos.coords.latitude
const lng = pos.coords.longitude

const report = {

name:document.getElementById("name").value,
phone:document.getElementById("phone").value,
age:document.getElementById("age").value,
disease:document.getElementById("disease").value,
location:document.getElementById("location").value,
date:new Date().toLocaleDateString(),
lat,
lng

}

const res = await fetch(API + "/report",{

method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(report)

})

const data = await res.json()

alert(data.status)

})

}

/* ================= ADMIN DASHBOARD ================= */

async function loadDashboard(){

const res = await fetch(API + "/reports")
const data = await res.json()

const table = document.getElementById("reportTable")

if(!table) return

table.innerHTML=""

let diseases = new Set()
let locations = new Set()

data.forEach(r=>{

diseases.add(r.disease)
locations.add(r.location)

table.innerHTML+=`

<tr>

<td>${r.name}</td>
<td>${r.disease}</td>
<td>${r.location}</td>
<td>${r.date}</td>

<td>
<button class="delete-btn" onclick="deleteReport('${r._id}')">
Delete
</button>
</td>

</tr>

`

})

document.getElementById("totalReports").innerText=data.length
document.getElementById("totalDiseases").innerText=diseases.size
document.getElementById("totalLocations").innerText=locations.size

}

/* ================= DELETE REPORT ================= */

async function deleteReport(id){

if(!confirm("Delete this report?")) return

await fetch(API + "/deleteReport/"+id,{
method:"DELETE"
})

location.reload()

}

/* ================= USER DASHBOARD ================= */

async function loadUserReports(){

const res = await fetch(API + "/reports")
const data = await res.json()

const table = document.getElementById("userTable")

if(!table) return

table.innerHTML=""

data.forEach(r=>{

table.innerHTML+=`

<tr>

<td>${r.disease}</td>
<td>${r.location}</td>
<td>${r.date}</td>

</tr>

`

})

}

/* ================= MAP ================= */

async function loadMap(){

if(!document.getElementById("map")) return

const res = await fetch(API + "/reports")
const reports = await res.json()

const map = L.map('map').setView([20.5937,78.9629],5)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map)

let markers=[]

reports.forEach(r=>{

if(r.lat && r.lng){

const marker = L.marker([r.lat,r.lng])
.addTo(map)
.bindPopup(`
<b>Disease:</b> ${r.disease}<br>
<b>Location:</b> ${r.location}<br>
<b>Date:</b> ${r.date}
`)

markers.push({
disease:r.disease,
marker
})

}

})

/* ===== DISEASE FILTER ===== */

const filter = document.getElementById("diseaseFilter")

if(filter){

const diseases=[...new Set(reports.map(r=>r.disease))]

diseases.forEach(d=>{

const option=document.createElement("option")
option.value=d
option.textContent=d
filter.appendChild(option)

})

filter.addEventListener("change",()=>{

const value=filter.value

markers.forEach(m=>{

if(value==="all" || m.disease===value){

map.addLayer(m.marker)

}else{

map.removeLayer(m.marker)

}

})

})

}

}

/* ================= ANALYTICS ================= */

async function loadAnalytics(){

const canvas=document.getElementById("chart")

if(!canvas) return

const res = await fetch(API + "/analytics")
const data = await res.json()

const labels = data.map(d=>d._id)
const counts = data.map(d=>d.count)

new Chart(canvas,{

type:"bar",

data:{
labels:labels,
datasets:[{

label:"Disease Reports",
data:counts

}]
}

})

}

/* ================= AUTO LOAD ================= */

window.onload=()=>{

loadDashboard()
loadUserReports()
loadMap()
loadAnalytics()

}