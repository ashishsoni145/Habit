let habits=[];
let userId=null;

const DAYS=30;
const today=new Date().getDate()-1;

auth.onAuthStateChanged(user=>{

if(!user){
window.location="index.html";
return;
}

userId=user.uid;
loadHabits();

});

async function addHabit(){

let name=document.getElementById("habitInput").value.trim();
if(!name) return;

let habit={
name,
days:Array(DAYS).fill(false)
};

await db.collection("users")
.doc(userId)
.collection("habits")
.add(habit);

document.getElementById("habitInput").value="";
loadHabits();

}

async function loadHabits(){

let snap=await db.collection("users")
.doc(userId)
.collection("habits")
.get();

habits=[];

snap.forEach(doc=>{
habits.push({id:doc.id,...doc.data()});
});

render();

}

async function toggleDay(id,day){

let h=habits.find(x=>x.id===id);
h.days[day]=!h.days[day];

await db.collection("users")
.doc(userId)
.collection("habits")
.doc(id)
.update(h);

render();

}

function render(){

let list=document.getElementById("habitList");
list.innerHTML="";

habits.forEach(h=>{

let row=document.createElement("div");
row.className="habitRow";

let name=document.createElement("div");
name.className="habitName";
name.innerText=h.name;

let ticks=document.createElement("div");
ticks.className="ticksRow";

h.days.forEach((d,i)=>{

let t=document.createElement("span");
t.className="tick";

if(d) t.classList.add("active");
if(i===today) t.classList.add("today");

t.onclick=()=>toggleDay(h.id,i);

ticks.appendChild(t);

});

row.appendChild(name);
row.appendChild(ticks);
list.appendChild(row);

});

updateStats();
drawCharts();

}

function updateStats(){

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

document.getElementById("totalHabits").innerText=total;
document.getElementById("completionPercent").innerText=percent+"%";

}

let pieChart,lineChart;

function drawCharts(){

let done=0,total=0;

habits.forEach(h=>{
h.days.forEach(d=>{
total++;
if(d) done++;
});
});

let remain=total-done;

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

let line=document.getElementById("lineChart");
if(line){

if(lineChart) lineChart.destroy();

lineChart=new Chart(line,{
type:"line",
data:{
labels:["W1","W2","W3","W4"],
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

function logout(){
auth.signOut();
}
