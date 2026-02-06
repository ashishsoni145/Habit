function signup(){

let email=document.getElementById("email").value;
let pass=document.getElementById("password").value;

auth.createUserWithEmailAndPassword(email,pass)
.then(()=>{
window.location="dashboard.html";
})
.catch(e=>alert(e.message));

}

function login(){

console.log("Login clicked");

let email=document.getElementById("email").value;
let pass=document.getElementById("password").value;

console.log("Trying Firebase login...");

auth.signInWithEmailAndPassword(email,pass)
.then(user=>{
console.log("SUCCESS LOGIN", user);
window.location="dashboard.html";
})
.catch(e=>{
console.log("LOGIN ERROR", e);
alert(e.message);
});

}

function googleLogin(){

const provider=new firebase.auth.GoogleAuthProvider();

auth.signInWithPopup(provider)
.then(()=>{
window.location="dashboard.html";
});

}