// ================= GLOBAL =================

let habits = [];
let userId = null;

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const DAYS_IN_VIEW = 31;

// ================= AUTH =================

auth.onAuthStateChanged(user => {

if (!user) {
window.location = "index.html";
return;
}

userId = user.uid;
loadHabits();

});

// ================= DATE HELPERS =================

function getDaysInMonth(month, year){
return new Date(year, month + 1, 0).getDate();
}

function getTodayIndex(){
let today = new Date();
if(today.getMonth() !== currentMonth) return -1;
return today.getDate() - 1;
}

// ================= ADD HABIT =================

function addHabit(){

let input = document.getElementById("habitInput");
let name = input.value.trim();

if(!name) return;

let daysCount = getDaysInMonth(currentMonth,currentYear);

habits.push({
name:name,
days:Array(daysCount).fill(false),
streak:0,
bestStreak:0
});

saveHabits();
render();

input.value="";

}

// ================= RENDER =================

function render(){

let list=document.getElementById("habitList");
list.innerHTML="";

let todayIndex = getTodayIndex();

habits.forEach((h,i)=>{

let row=document.createElement("div");
row.className="habitRow";

// NAME
let name=document.createElement("div");
name.className="habitName";
name.innerText=h.name;

// TICKS
let ticks=document.createElement("div");
ticks.className="ticksRow";

h.days.forEach((d,di)=>{

let tick=document.createElement("span");

tick.className="tick";

if(d) tick.classList.add("active");
if(di===todayIndex) tick.classList.add("today");

if(di>todayIndex && todayIndex!==-1){
tick.classList.add("future");
}

tick.onclick=()=>{
if(di<=todayIndex || todayIndex===-1){
toggleDay(i,di);
}
};

ticks.appendChild(tick);

});

row.appendChild(name);
row.appendChild(ticks);

list.appendChild(row);

});

updateStats();
updateStreaks();
drawCharts();

}

// ================= TOGGLE =================

function toggleDay(habitIndex,dayIndex){

habits[habitIndex].days[dayIndex] =
!habits[habitIndex].days[dayIndex];

saveHabits();
render();

}

// ================= STREAK SYSTEM =================

function updateStreaks(){

habits.forEach(h=>{

let streak=0;
let best=0;

h.days.forEach(d=>{
if(d){
streak++;
best=Math.max(best,streak);
}else{
streak=0;
}
});

h.streak=streak;
h.bestStreak=best;

});

}

// ================= FIREBASE =================

function saveHabits(){

db.collection("habits")
.doc(userId)
.set({
habits,
month:currentMonth,
year:currentYear
});

}

function loadHabits(){

db.collection("habits")
.doc(userId)
.get()
.then(doc=>{

if(doc.exists){
let data=doc.data();
habits=data.habits || [];
currentMonth=data.month ?? currentMonth;
currentYear=data.year ?? currentYear;
}

render();

});

}

// ================= STATS =================

function updateStats(){

let totalEl=document.getElementById("totalHabits");
let percentEl=document.getElementById("completionPercent");

if(!totalEl) return;

let total=habits.length;
let done=0;
let all=0;

habits.forEach(h=>{
h.days.forEach(d=>{
all++;
if(d) done++;
});
});

let percent=all?Math.round(done/all*100):0;

totalEl.innerText=total;
percentEl.innerText=percent+"%";

}

// ================= CHARTS =================

let pieChart=null;
let lineChart=null;

function drawCharts(){

if(typeof Chart==="undefined") return;

let done=0;
let total=0;

habits.forEach(h=>{
h.days.forEach(d=>{
total++;
if(d) done++;
});
});

let remain=total-done;

// PIE
let pie=document.getElementById("pieChart");
if(pie){

if(pieChart) pieChart.destroy();

pieChart=new Chart(pie,{
type:"pie",
data:{
labels:["Done","Remaining"],
datasets:[{
data:[done,remain],
backgroundColor:["#22c55e","#e5e7eb"]
}]
}
});

}

// LINE WEEK TREND
let line=document.getElementById("lineChart");
if(line){

if(lineChart) lineChart.destroy();

let weekly=[0,0,0,0];

habits.forEach(h=>{
h.days.forEach((d,i)=>{
if(d){
weekly[Math.floor(i/7)]++;
}
});
});

lineChart=new Chart(line,{
type:"line",
data:{
labels:["W1","W2","W3","W4"],
datasets:[{
label:"Completion",
data:weekly,
borderColor:"#22c55e",
fill:false
}]
}
});

}

}

// ================= MONTH SWITCH =================

function nextMonth(){
currentMonth++;
if(currentMonth>11){
currentMonth=0;
currentYear++;
}
saveHabits();
render();
}

function prevMonth(){
currentMonth--;
if(currentMonth<0){
currentMonth=11;
currentYear--;
}
saveHabits();
render();
}

// ================= LOGOUT =================

function logout(){
auth.signOut();
}
