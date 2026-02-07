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

function setView(v){
viewMode=v;
render();
}

function setupMonthSelector(){
let select=document.getElementById("monthSelect");

for(let i=0;i<12;i++){
let opt=document.createElement("option");
opt.value=i;
opt.text=new Date(0,i).toLocaleString('default',{month:'long'});
if(i===selectedMonth) opt.selected=true;
select.appendChild(opt);
}

select.onchange=()=>{
selectedMonth=parseInt(select.value);
loadHabits();
}
}

function daysInMonth(m,y){
return new Date(y,m+1,0).getDate();
}

function getMonthKey(){
return selectedYear+"-"+selectedMonth;
}

function addHabit(){
let name=document.getElementById("habitInput").value.trim();
if(!name) return;

let days=daysInMonth(selectedMonth,selectedYear);

habits.push({
name,
months:{
[getMonthKey()]:Array(days).fill(false)
}
});

document.getElementById("habitInput").value="";
saveHabits();
render();
}

function renderDateHeader(){
let header=document.getElementById("dateHeader");
header.innerHTML="";

let days=daysInMonth(selectedMonth,selectedYear);

for(let i=1;i<=days;i++){
let s=document.createElement("span");
s.innerText=i;
header.appendChild(s);
}
}

function render(){

renderDateHeader();

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

h.months[key].slice(start,end).forEach((done,i)=>{

let real=start+i;
let dayNum=real+1;

let box=document.createElement("span");
box.className="dayBox";

if(done) box.classList.add("done");

if(dayNum===todayDate &&
selectedMonth===todayMonth &&
selectedYear===todayYear){
box.classList.add("today");
}

if(dayNum>todayDate &&
selectedMonth===todayMonth &&
selectedYear===todayYear){
box.classList.add("disabled");
}else{
box.onclick=()=>toggleDay(hIndex,real);
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
habits[hIndex].months[key][dIndex]=
!habits[hIndex].months[key][dIndex];

saveHabits();
render();
}

function updateAnalytics(){

let key=getMonthKey();

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

let completion= totalDays===0?0:
Math.round(doneDays/totalDays*100);

document.getElementById("totalHabits").innerText=habits.length;
document.getElementById("completion").innerText=completion+"%";

drawPie(doneDays,totalDays-doneDays);
drawProgress(dayTotals);
}

function drawPie(done,remain){

let ctx=document.getElementById("pieChart").getContext("2d");
if(pieChart) pieChart.destroy();

pieChart=new Chart(ctx,{
type:"pie",
data:{
labels:["Done","Remaining"],
datasets:[{data:[done,remain]}]
}
});
}

function drawProgress(dayTotals){

let weekly=[0,0,0,0,0];

dayTotals.forEach((v,i)=>{
weekly[Math.floor(i/7)]+=v;
});

let ctx=document.getElementById("progressChart").getContext("2d");
if(progressChart) progressChart.destroy();

progressChart=new Chart(ctx,{
type:"line",
data:{
labels:["W1","W2","W3","W4","W5"],
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
habits=doc.exists?doc.data().habits:[];
render();
});
}

function logout(){
auth.signOut();
}
