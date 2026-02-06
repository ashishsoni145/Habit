let habits = [];
let userId = null;

auth.onAuthStateChanged(user => {
  
  if (user === undefined) return;
  
  if (!user) {
    window.location = "login.html";
    return;
  }
  
  userId = user.uid;
  loadHabits();
  
});

function addHabit() {
  
  let input = document.getElementById("habitInput");
  let name = input.value.trim();
  
  if (!name) return;
  
  habits.push(name);
  
  saveHabits();
  render();
  
  input.value = "";
}

function render() {
  
  let list = document.getElementById("habitList");
  list.innerHTML = "";
  
  habits.forEach(h => {
    let div = document.createElement("div");
    div.className = "habit";
    div.textContent = h;
    list.appendChild(div);
  });
  
}

function saveHabits() {
  
  db.collection("habits")
    .doc(userId)
    .set({ habits });
  
}

function loadHabits() {
  
  db.collection("habits")
    .doc(userId)
    .get()
    .then(doc => {
      if (doc.exists) {
        habits = doc.data().habits || [];
        render();
      }
    });
  
}

function logout() {
  auth.signOut();
}