let habits=[];
let userId=null;

let pieChart=null;
let progressChart=null;

let today=new Date();
let todayDate=today.getDate();
let todayMonth=today.getMonth();
let todayYear=today.getFullYear();

let selectedMonth=todayMonth;
let selectedYear=todayYear;

let viewMode="month";

auth.onAuthStateChanged(user=>{
if(!user){
window.location="login.html";
}else{
userId=user.uid;
setupMonthSelector();
loadHabits();
}
});

function setupMonthSelector(){
let select=document.getElementById("monthSelect");
select.innerHTML="";

for(let i=0;i<12;i++){
let opt=document.createElement("option");
opt.value=i;
opt.text=new Date(0,i).toLocaleString("default",{month:"long"});
if(i===selectedMonth) opt.selected=true;
select.appendChild(opt);
}

select.onchange=()=>{
selectedMonth=Number(select.value);
render();
};
}

function setView(mode){
viewMode=mode;
render();
}

function daysInMonth(m,y){
return new Date(y,m+1,0).getDate();
}

function getMonthKey(){
return selectedYear+"-"+selectedMonth;
}

function addHabit(){
let input=document.getElementById("habitInput");
let name=input.value.trim();
if(!name) return;

let days=daysInMonth(selectedMonth,selectedYear);

habits.push({
name,
months:{
[getMonthKey()]:Array(days).fill(false)
}
});

input.value="";
saveHabits();
render();
}

function render(){

let list=document.getElementById("habitList");
list.innerHTML="";

let key=getMonthKey();
let daysCount=daysInMonth(selectedMonth,selectedYear);

habits.forEach((h,hIndex)=>{

if(!h.months) h.months={};
if(!h.months[key]) h.months[key]=Array(daysCount).fill(false);

let row=document.createElement("div");
row.className="habitRow";

let title=document.createElement("div");
title.className="habitTitle";
title.innerText=h.name;

let daysRow=document.createElement("div");
daysRow.className="daysRow";

let start=0;
let end=daysCount;

if(viewMode==="week"){
let week=Math.ceil(todayDate/7);
start=(week-1)*7;
end=start+7;
}

h.months[key].slice(start,end).forEach((done,dIndex)=>{

let realIndex=start+dIndex;
let dayNumber=realIndex+1;

let box=document.createElement("span");
box.className="dayBox";

if(done) box.classList.add("done");
if(dayNumber===todayDate) box.classList.add("today");

if(dayNumber>todayDate && selectedMonth===todayMonth && selectedYear===todayYear){
box.classList.add("disabled");
}else{
box.onclick=()=>toggleDay(hIndex,realIndex);
}

daysRow.appendChild(box);
});

row.appendChild(title);
row.appendChild(daysRow);
list.appendChild(row);

});

updateAnalytics();
}

function toggleDay(hIndex,dIndex){
let key=getMonthKey();
habits[hIndex].months[key][dIndex]=!habits[hIndex].months[key][dIndex];
saveHabits();
render();
}

function updateAnalytics(){

let key=getMonthKey();

let totalHabits=habits.length;
let totalDays=0;
let doneDays=0;

let dayTotals=[];
let daysCount=daysInMonth(selectedMonth,selectedYear);

for(let i=0;i<daysCount;i++) dayTotals[i]=0;

habits.forEach(h=>{
if(!h.months || !h.months[key]) return;

h.months[key].forEach((d,i)=>{
totalDays++;
if(d){
doneDays++;
dayTotals[i]++;
}
});
});

let completion=totalDays===0?0:Math.round(doneDays/totalDays*100);

document.getElementById("totalHabits").innerText=totalHabits;
document.getElementById("completion").innerText=completion+"%";

calculateStreak(key);
drawPie(doneDays,totalDays-doneDays);
drawProgress(dayTotals);
}

function calculateStreak(key){

let current=0;
let best=0;
let streak=0;

let daysCount=daysInMonth(selectedMonth,selectedYear);

for(let d=0;d<daysCount;d++){

let allDone=habits.every(h=>h.months && h.months[key] && h.months[key][d]);

if(allDone){
streak++;
best=Math.max(best,streak);
}else{
streak=0;
}

if(d===todayDate-1) current=streak;
}

document.getElementById("streak").innerText=current;
document.getElementById("bestStreak").innerText=best;
}

function drawPie(done,remaining){

let ctx=document.getElementById("pieChart").getContext("2d");

if(pieChart) pieChart.destroy();

pieChart=new Chart(ctx,{
type:"pie",
data:{
labels:["Done","Remaining"],
datasets:[{data:[done,remaining]}]
}
});
}

function drawProgress(dayTotals){

let weeks=["W1","W2","W3","W4","W5"];
let weekly=[0,0,0,0,0];

dayTotals.forEach((v,i)=>{
weekly[Math.floor(i/7)]+=v;
});

let ctx=document.getElementById("progressChart").getContext("2d");

if(progressChart) progressChart.destroy();

progressChart=new Chart(ctx,{
type:"line",
data:{
labels:weeks,
datasets:[{
label:"Progress",
data:weekly
}]
}
});
}

function saveHabits(){
db.collection("habits").doc(userId).set({habits});
}

function loadHabits(){
db.collection("habits").doc(userId).get().then(doc=>{
habits=doc.exists?doc.data().habits||[]:[];
render();
});
}

function logout(){
auth.signOut();
}
