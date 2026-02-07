// ================= GLOBAL STATE =================

let habits = [];
let userId = null;

let pieChart = null;
let progressChart = null;

const today = new Date();
const todayDate = today.getDate();
const todayMonth = today.getMonth();
const todayYear = today.getFullYear();

let selectedMonth = todayMonth;
let selectedYear = todayYear;

let viewMode = "month";

// ================= AUTH =================

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location = "login.html";
  } else {
    userId = user.uid;
    setupMonthSelector();
    loadHabits();
  }
});

// ================= DATE HELPERS =================

function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthKey() {
  return `${selectedYear}-${selectedMonth}`;
}

// ================= VIEW MODE =================

function setView(mode) {
  viewMode = mode;
  render();
}

// ================= MONTH SELECTOR =================

function setupMonthSelector() {
  const select = document.getElementById("monthSelect");
  if (!select) return;

  select.innerHTML = "";

  for (let m = 0; m < 12; m++) {
    let option = document.createElement("option");
    option.value = m;
    option.text = new Date(0, m).toLocaleString("default", { month: "long" });

    if (m === selectedMonth) option.selected = true;

    select.appendChild(option);
  }

  select.onchange = () => {
    selectedMonth = Number(select.value);
    render();
  };
}

// ================= ADD HABIT =================

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

// ================= RENDER =================

function render() {

  const list = document.getElementById("habitList");
  if (!list) return;

  list.innerHTML = "";

  const key = getMonthKey();
  const daysCount = daysInMonth(selectedMonth, selectedYear);

  habits.forEach((habit, hIndex) => {

    if (!habit.months) habit.months = {};
    if (!habit.months[key]) habit.months[key] = Array(daysCount).fill(false);

    let row = document.createElement("div");
    row.className = "habitRow";

    let title = document.createElement("div");
    title.className = "habitTitle";
    title.innerText = habit.name;

    let daysRow = document.createElement("div");
    daysRow.className = "daysRow";

    let startDay = 0;
    let endDay = daysCount;

    if (viewMode === "week") {
      let week = Math.ceil(todayDate / 7);
      startDay = (week - 1) * 7;
      endDay = Math.min(startDay + 7, daysCount);
    }

    habit.months[key].slice(startDay, endDay).forEach((done, dIndex) => {

      let realIndex = startDay + dIndex;
      let dayNumber = realIndex + 1;

      let box = document.createElement("span");
      box.className = "dayBox";

      if (done) box.classList.add("done");

      if (
        dayNumber === todayDate &&
        selectedMonth === todayMonth &&
        selectedYear === todayYear
      ) {
        box.classList.add("today");
      }

      if (
        dayNumber > todayDate &&
        selectedMonth === todayMonth &&
        selectedYear === todayYear
      ) {
        box.classList.add("disabled");
      } else {
        box.onclick = () => toggleDay(hIndex, realIndex);
      }

      daysRow.appendChild(box);
    });

    row.appendChild(title);
    row.appendChild(daysRow);
    list.appendChild(row);
  });

  updateAnalytics();
}

// ================= TOGGLE DAY =================

function toggleDay(hIndex, dIndex) {
  let key = getMonthKey();
  habits[hIndex].months[key][dIndex] =
    !habits[hIndex].months[key][dIndex];

  saveHabits();
  render();
}

// ================= ANALYTICS =================

function updateAnalytics() {

  const key = getMonthKey();

  let totalHabits = habits.length;
  let totalDays = 0;
  let doneDays = 0;

  let daysCount = daysInMonth(selectedMonth, selectedYear);
  let dayTotals = new Array(daysCount).fill(0);

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

  let completion = totalDays === 0 ? 0 : Math.round(doneDays / totalDays * 100);

  if (document.getElementById("totalHabits"))
    document.getElementById("totalHabits").innerText = totalHabits;

  if (document.getElementById("completion"))
    document.getElementById("completion").innerText = completion + "%";

  calculateStreak(key);
  drawPie(doneDays, totalDays - doneDays);
  drawProgress(dayTotals);
}

// ================= STREAK =================

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

  if (document.getElementById("streak"))
    document.getElementById("streak").innerText = current;

  if (document.getElementById("bestStreak"))
    document.getElementById("bestStreak").innerText = best;
}

// ================= CHARTS =================

function drawPie(done, remaining) {

  let canvas = document.getElementById("pieChart");
  if (!canvas) return;

  let ctx = canvas.getContext("2d");

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Done", "Remaining"],
      datasets: [{
        data: [done, remaining]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function drawProgress(dayTotals) {

  let weeks = ["W1","W2","W3","W4","W5"];
  let weekly = [0,0,0,0,0];

  dayTotals.forEach((v,i)=>{
    weekly[Math.floor(i/7)] += v;
  });

  let canvas = document.getElementById("progressChart");
  if (!canvas) return;

  let ctx = canvas.getContext("2d");

  if (progressChart) progressChart.destroy();

  progressChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: weeks,
      datasets: [{
        label: "Progress",
        data: weekly
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// ================= FIREBASE =================

function saveHabits() {
  db.collection("habits").doc(userId).set({ habits });
}

function loadHabits() {
  db.collection("habits").doc(userId).get().then(doc => {
    habits = doc.exists ? doc.data().habits || [] : [];
    render();
  });
}

// ================= LOGOUT =================

function logout() {
  auth.signOut();
}
