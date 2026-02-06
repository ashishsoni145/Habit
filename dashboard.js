// =======================
// GLOBAL VARIABLES
// =======================

let habits = [];
let userId = null;

// =======================
// AUTH CHECK
// =======================

auth.onAuthStateChanged(user => {

if (!user) {
window.location = "index.html";
return;
}

userId = user.uid;
loadHabits();

});

// =======================
// ADD HABIT
// =======================

function addHabit(){

let input = document.getElementById("habitInput");
let name = input.value.trim();

if(!name) return;

habits.push({
name: name,
days: Array(30).fill(false)
});

saveHabits();
render();

input.value="";

}

// =======================
// RENDER HABITS (NOTION GRID)
// =======================

function render(){

let list = document.getElementById("habitList");
list.innerHTML="";

habits.forEach((h,i)=>{

let habitHTML = `
<div class="habit">
<strong>${h.name}</strong>
<div>
`;

let daysHTML = "";

h.days.forEach((d,di)=>{
daysHTML += `
<span 
class="${d ? 'active' : ''}" 
onclick="toggleDay(${i},${di})">
</span>
`;
});

habitHTML += daysHTML + "</div></div>";

list.innerHTML += habitHTML;

});

updateStats();
drawCharts();

}

// =======================
// TOGGLE DAY
// =======================

function toggleDay(habitIndex, dayIndex){

habits[habitIndex].days[dayIndex] =
!habits[habitIndex].days[dayIndex];

saveHabits();
render();

}

// =======================
// FIREBASE SAVE
// =======================

function saveHabits(){

db.collection("habits")
.doc(userId)
.set({ habits });

}

// =======================
// FIREBASE LOAD
// =======================

function loadHabits(){

db.collection("habits")
.doc(userId)
.get()
.then(doc => {

if(doc.exists){
habits = doc.data().habits || [];
render();
}

});

}

// =======================
// STATS UPDATE
// =======================

function updateStats(){

let totalHabitsEl = document.getElementById("totalHabits");
let completionEl = document.getElementById("completionPercent");

if(!totalHabitsEl || !completionEl) return;

let total = habits.length;
let done = 0;
let all = 0;

habits.forEach(h=>{
h.days.forEach(d=>{
all++;
if(d) done++;
});
});

let percent = all ? Math.round(done / all * 100) : 0;

totalHabitsEl.innerText = total;
completionEl.innerText = percent + "%";

}

// =======================
// CHARTS
// =======================

let pieChart = null;
let lineChart = null;

function drawCharts(){

if(typeof Chart === "undefined") return;

let done = 0;
let total = 0;

habits.forEach(h=>{
h.days.forEach(d=>{
total++;
if(d) done++;
});
});

let remaining = total - done;

// PIE CHART
let pieCtx = document.getElementById("pieChart");
if(pieCtx){

if(pieChart) pieChart.destroy();

pieChart = new Chart(pieCtx,{
type:"pie",
data:{
labels:["Done","Remaining"],
datasets:[{
data:[done, remaining],
backgroundColor:["#22c55e","#e5e7eb"]
}]
}
});
}

// LINE CHART
let lineCtx = document.getElementById("lineChart");
if(lineCtx){

if(lineChart) lineChart.destroy();

lineChart = new Chart(lineCtx,{
type:"line",
data:{
labels:["Week1","Week2","Week3","Week4"],
datasets:[{
label:"Progress",
data:[
Math.random()*100,
Math.random()*100,
Math.random()*100,
Math.random()*100
],
borderColor:"#22c55e",
fill:false
}]
}
});
}

}

// =======================
// LOGOUT
// =======================

function logout(){
auth.signOut();
}
