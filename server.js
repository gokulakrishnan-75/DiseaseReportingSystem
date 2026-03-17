const API = window.location.origin;

/* SIGNUP */

async function signup(){

const username = document.getElementById("username").value
const password = document.getElementById("password").value

const res = await fetch(API + "/signup",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({username,password})
})

const data = await res.json()

if(data.status){
alert("Signup Successful")
window.location="login.html"
}else{
alert("Signup Failed")
}

}


/* LOGIN */

async function login(){

const username = document.getElementById("username").value
const password = document.getElementById("password").value

const res = await fetch(API + "/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
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
alert("Invalid login")
}

}


/* ---------------- REPORT DISEASE ---------------- */

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

let res = await fetch("/report",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
})

let result = await res.json()

if(result.status){

alert("Report Submitted Successfully")

}else{

alert("Error submitting report")

}

}


/* ---------------- LOAD REPORTS ---------------- */

async function loadReports(){

let res = await fetch("/reports")

let data = await res.json()

let table = document.getElementById("reports")

if(!table) return

table.innerHTML=""

data.forEach(r=>{

let row = `
<tr>

<td><input type="checkbox" class="selectReport" value="${r._id}"></td>

<td>${r.name}</td>
<td>${r.age}</td>
<td>${r.phone}</td>
<td>${r.disease}</td>

<td>
${r.location}<br>
<a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank" class="map-link">
📍 View on Map
</a>
</td>

<td>${r.date}</td>

<td>
<button class="deleteBtn" onclick="deleteReport('${r._id}')">Delete</button>
</td>

</tr>
`

table.innerHTML += row

})

}


/* ---------------- DELETE REPORT ---------------- */

async function deleteReport(id){

if(confirm("Delete this report?")){

await fetch("/deleteReport/"+id,{
method:"DELETE"
})

loadReports()

}

}


/* ---------------- BULK DELETE ---------------- */

async function deleteSelected(){

let checkboxes = document.querySelectorAll(".selectReport:checked")

let ids=[]

checkboxes.forEach(cb=>{
ids.push(cb.value)
})

await fetch("/bulkDelete",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({ids})

})

alert("Selected Reports Deleted")

loadReports()

}


/* ---------------- DOWNLOAD CSV ---------------- */

function downloadReports(){

window.location="/download"

}


/* ---------------- ANALYTICS CHART ---------------- */

async function loadAnalytics(){

let res = await fetch("/analytics")

let data = await res.json()

let labels = data.map(d=>d._id)
let values = data.map(d=>d.count)

new Chart(document.getElementById("chart"),{

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


/* ---------------- HEATMAP ---------------- */

async function loadHeatmap(){

let res = await fetch("/reports")

let reports = await res.json()

let map = L.map('map').setView([20.5937,78.9629],5)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map)

let heatPoints=[]

reports.forEach(r=>{

if(r.lat && r.lng){

heatPoints.push([r.lat,r.lng,0.5])

}

})

L.heatLayer(heatPoints,{
radius:25,
blur:15,
maxZoom:10
}).addTo(map)

}


/* ---------------- GPS LOCATION ---------------- */

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


/* ---------------- PAGE LOAD ---------------- */

window.onload=function(){

loadReports()

if(document.getElementById("map")){
loadHeatmap()
}

}
/* NAVIGATION + ACTIVE MENU */
function navigate(btn, page){

document.querySelectorAll(".menu-btn").forEach(b=>{
b.classList.remove("active")
})

btn.classList.add("active")

window.location = page
}


/* LOGOUT */
function logout(){

localStorage.clear()
alert("Logged out successfully")
window.location="login.html"

}


/* TOGGLE THEME */
function toggleTheme(){

let isLight = document.body.classList.toggle("light-mode")

localStorage.setItem("theme", isLight ? "light" : "dark")

}


/* APPLY THEME ON LOAD */
function applyTheme(){

let theme = localStorage.getItem("theme")

if(theme === "light"){
document.body.classList.add("light-mode")
}else{
document.body.classList.remove("light-mode")
}

}
function toggleTheme(){

let isLight = document.body.classList.toggle("light-mode")

localStorage.setItem("theme", isLight ? "light" : "dark")

document.querySelector(".toggle-btn").innerText = 
isLight ? "☀ Light Mode" : "🌙 Dark Mode"

}
async function loadInsightsAndActivity(){

let res = await fetch("/reports")
let data = await res.json()

/* ===== INSIGHTS ===== */
let insights = []

// Top disease
let diseaseCount={}
data.forEach(r=>{
diseaseCount[r.disease]=(diseaseCount[r.disease]||0)+1
})

let topDisease="-", max=0
for(let d in diseaseCount){
if(diseaseCount[d]>max){
max=diseaseCount[d]
topDisease=d
}
}

insights.push(`Top disease: ${topDisease}`)

// High risk location
let locationCount={}
data.forEach(r=>{
locationCount[r.location]=(locationCount[r.location]||0)+1
})

let highArea="-", maxLoc=0
for(let l in locationCount){
if(locationCount[l]>maxLoc){
maxLoc=locationCount[l]
highArea=l
}
}

insights.push(`High risk area: ${highArea}`)

// Total cases insight
insights.push(`Total reports: ${data.length}`)

/* UPDATE INSIGHTS UI */
let insightsHTML=""
insights.forEach(i=>{
insightsHTML += `<li>${i}</li>`
})

document.getElementById("insightsList").innerHTML = insightsHTML


/* ===== RECENT ACTIVITY ===== */
let activityHTML=""

// show last 5 reports
data.slice(-5).reverse().forEach(r=>{
activityHTML += `<li>📝 ${r.name} reported ${r.disease} in ${r.location}</li>`
})

document.getElementById("activityList").innerHTML = activityHTML

}
setInterval(loadInsightsAndActivity, 5000) // every 5 sec
