let habits = [];
let userId = null;

let pieChart, lineChart;

auth.onAuthStateChanged(user=>{
if(!user){
window.location="index.html";
return;
}

userId=user.uid;
loadHabits();

});

function addHabit(){

let name=document.getElementById("habitInput").value.trim();
if(!name) return;

habits.push({
name:name,
days:Array(30).fill(false)
});

saveHabits();
render();

document.getElementById("habitInput").value="";
}

function toggleDay(habitIndex,dayIndex){

habits[habitIndex].days[dayIndex]=
!habits[habitIndex].days[dayIndex];

saveHabits();
render();

}

function render(){

let list=document.getElementById("habitList");
list.innerHTML="";

habits.forEach((h,i)=>{

let div=document.createElement("div");
div.className="habit";

let daysHTML="";

h.days.forEach((d,di)=>{
daysHTML+=`
<span onclick="toggleDay(${i},${di})"
style="
display:inline-block;
width:16px;
height:16px;
margin:2px;
border-radius:4px;
background:${d?"#22c55e":"#e5e7eb"};
cursor:pointer;
"></span>
`;
});

div.innerHTML=`
<div>
<strong>${h.name}</strong>
<div>${daysHTML}</div>
</div>
`;

list.appendChild(div);

});

updateStats();

}

function updateStats(){

let total=habits.length;
let totalDays=0;
let completed=0;

habits.forEach(h=>{
h.days.forEach(d=>{
totalDays++;
if(d) completed++;
});
});

let percent= totalDays? Math.round(completed/totalDays*100):0;

document.getElementById("totalHabits").innerText=total;
document.getElementById("completionPercent").innerText=percent+"%";

drawCharts(completed,totalDays);

}

function drawCharts(done,total){

if(pieChart) pieChart.destroy();
if(lineChart) lineChart.destroy();

pieChart=new Chart(document.getElementById("pieChart"),{
type:"pie",
data:{
labels:["Done","Remaining"],
datasets:[{
data:[done,total-done]
}]
}
});

lineChart=new Chart(document.getElementById("lineChart"),{
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
]
}]
}
});

}

function saveHabits(){
db.collection("habits").doc(userId).set({habits});
}

function loadHabits(){
db.collection("habits").doc(userId).get().then(doc=>{
if(doc.exists){
habits=doc.data().habits||[];
render();
}
});
}

function logout(){
auth.signOut();
}