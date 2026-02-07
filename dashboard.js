// ===== GLOBAL STATE =====

let habits = [];
let userId = null;

let pieChart = null;
let progressChart = null;

let today = new Date();
let todayDate = today.getDate();
let todayMonth = today.getMonth();
let todayYear = today.getFullYear();

let selectedMonth = todayMonth;
let selectedYear = todayYear;

let viewMode = "month";

// ===== AUTH =====

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location = "login.html";
  } else {
    userId = user.uid;
    setupMonthSelector();
    loadHabits();
  }
});

// ===== VIEW MODE =====

function setView(mode){
  viewMode = mode;
  render();
}

// ===== MONTH SELECTOR =====

function setupMonthSelector() {
  const select = document.getElementById("monthSelect");
  select.innerHTML = "";

  for (let m = 0; m < 12; m++) {
    let option = document.createElement("option");
    option.value = m;
    option.text = new Date(0, m).toLocaleString('default', { month: 'long' });

    if (m === selectedMonth) option.selected = true;
    select.appendChild(option);
  }

  select.onchange = () => {
    selectedMonth = Number(select.value);
    loadHabits();
  };
}

// ===== DATE HELPERS =====

function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthKey() {
  return `${selectedYear}-${selectedMonth}`;
}

// ===== ADD HABIT =====

function addHabit() {

  let input = document.getElementById("habitInput");
  let name = input.value.trim();
  if (!name) return;

  let daysCount = daysInMonth(selectedMonth, selectedYear);

  habits.push({
    name,
    months: {
      [getMonthKey()]: Array(daysCount).fill(false)
    }
  });

  input.value = "";
  saveHabits();
  render();
}

// ===== RENDER UI =====

function render(){

  const list=document.getElementById("habitList");
  list.innerHTML="";

  const key=getMonthKey();
  const daysCount=daysInMonth(selectedMonth,selectedYear);
  // ⭐ DATE HEADER FIX ADD HERE
  const header = document.getElementById("dateHeader");
  header.innerHTML = "";

  header.style.gridTemplateColumns =
    `repeat(${daysCount}, 22px)`;

  for(let d=1; d<=daysCount; d++){
    let el = document.createElement("span");
    el.className = "dateCell";
    el.innerText = d;
    header.appendChild(el);
  }

  // ⭐ DYNAMIC GRID HEADER FIX
  document.getElementById("dateHeader").style.gridTemplateColumns =
    `repeat(${daysCount}, 22px)`;

  habits.forEach((habit,hIndex)=>{

    if(!habit.months) habit.months={};
    if(!habit.months[key]) habit.months[key]=Array(daysCount).fill(false);

    let row=document.createElement("div");
    row.className="habitRow";

    let title=document.createElement("div");
    title.className="habitTitle";
    title.innerText=habit.name;

    let daysRow=document.createElement("div");
    daysRow.className="daysRow";

    // ⭐ DYNAMIC GRID PER ROW FIX
    daysRow.style.gridTemplateColumns =
      `repeat(${daysCount}, 22px)`;

    let startDay=0;
    let endDay=daysCount;

    if(viewMode==="week"){
      let week=Math.ceil(todayDate/7);
      startDay=(week-1)*7;
      endDay=startDay+7;
    }

    habit.months[key]
    .slice(startDay,endDay)
    .forEach((done,dIndex)=>{

      let realIndex=startDay+dIndex;
      let dayNumber=realIndex+1;

      let box=document.createElement("span");
      box.className="dayBox";

      if(done) box.classList.add("done");

      if(dayNumber===todayDate &&
        selectedMonth===todayMonth &&
        selectedYear===todayYear){
        box.classList.add("today");
      }

      // ⭐ FUTURE DISABLE FIX
      let isCurrentMonth =
        selectedMonth === todayMonth &&
        selectedYear === todayYear;

      if(isCurrentMonth && dayNumber > todayDate){
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

// ===== TOGGLE DAY =====

function toggleDay(hIndex,dIndex){

  let key=getMonthKey();

  habits[hIndex].months[key][dIndex] =
    !habits[hIndex].months[key][dIndex];

  saveHabits();
  render();
}

// ===== ANALYTICS =====

function updateAnalytics() {

  const key = getMonthKey();

  let totalHabits = habits.length;
  let totalDays = 0;
  let doneDays = 0;

  let dayTotals = [];
  let daysCount = daysInMonth(selectedMonth, selectedYear);

  for (let i = 0; i < daysCount; i++) dayTotals[i] = 0;

  habits.forEach(h => {
    if (!h.months || !h.months[key]) return;

    h.months[key].forEach((d, i) => {
      totalDays++;
      if (d) {
        doneDays++;
        dayTotals[i]++;
      }
    });
  });

  let completion =
    totalDays === 0 ? 0 :
    Math.round(doneDays / totalDays * 100);

  document.getElementById("totalHabits").innerText = totalHabits;
  document.getElementById("completion").innerText = completion + "%";

  calculateStreak(key);
  drawPie(doneDays, totalDays - doneDays);
  drawProgress(dayTotals);
}

// ===== STREAK =====

function calculateStreak(key) {

  let current = 0;
  let best = 0;
  let streak = 0;

  let daysCount = daysInMonth(selectedMonth, selectedYear);

  for (let d = 0; d < daysCount; d++) {

    let allDone = habits.every(h =>
      h.months &&
      h.months[key] &&
      h.months[key][d]
    );

    if (allDone) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 0;
    }

    if (d === todayDate - 1) current = streak;
  }

  document.getElementById("streak").innerText = current;
  document.getElementById("bestStreak").innerText = best;
}

// ===== PIE CHART =====

function drawPie(done, remaining) {

  let ctx = document.getElementById("pieChart").getContext("2d");

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Done", "Remaining"],
      datasets: [{
        data: [done, remaining]
      }]
    }
  });
}

// ===== PROGRESS CHART =====

function drawProgress(dayTotals) {

  let weeks = ["W1","W2","W3","W4","W5"];
  let weekly = [0,0,0,0,0];

  dayTotals.forEach((v,i)=>{
    weekly[Math.floor(i/7)] += v;
  });

  let ctx =
    document.getElementById("progressChart").getContext("2d");

  if (progressChart) progressChart.destroy();

  progressChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: weeks,
      datasets: [{
        label: "Progress",
        data: weekly
      }]
    }
  });
}

// ===== FIREBASE SAVE =====

function saveHabits() {
  db.collection("habits").doc(userId).set({ habits });
}

// ===== FIREBASE LOAD =====

function loadHabits() {
  db.collection("habits").doc(userId).get().then(doc => {
    habits = doc.exists ? doc.data().habits || [] : [];
    render();
  });
}

// ===== LOGOUT =====

function logout() {
  auth.signOut();
}
