// -----------------------------
// SUPABASE CONNECTION
// -----------------------------
const db = window.supabase.createClient(
  "https://cfhhcmyfewwvdylqvcdg.supabase.co",
  "sb_publishable_54d-5PRIOoE5gQ3HtHyAUg_5N1Cjh7F"
);

// -----------------------------
// REGISTER STUDENT
// -----------------------------
async function registerStudent() {

  const reg = document.getElementById("reg").value.trim();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const sem = document.getElementById("semester").value;
  const pass = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (!reg || !name || !email || !sem || !pass || !confirm) {
    alert("Please fill all fields.");
    return;
  }

  if (pass !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  // Create login account
  const { error: authError } = await db.auth.signUp({
    email: email,
    password: pass
  });

  if (authError) {
    alert(authError.message);
    return;
  }

  // Save student details
  const { error: dbError } = await db.from("students").insert({
    reg_no: reg,
    name: name,
    email: email,
    semester: Number(sem)
  });

  if (dbError) {
    alert(dbError.message);
    return;
  }

  alert("Account created successfully!");

  showLogin();
}

// -----------------------------
// LOGIN
// -----------------------------
async function loginStudent() {

  const reg = document.getElementById("loginReg").value.trim();
  const pass = document.getElementById("loginPass").value;

  if (!reg || !pass) {
    alert("Enter Register Number and Password.");
    return;
  }

  const { data: student, error } = await db
    .from("students")
    .select("*")
    .eq("reg_no", reg)
    .single();

  if (error || !student) {
    alert("Register Number not found.");
    return;
  }

  const { error: loginError } = await db.auth.signInWithPassword({
    email: student.email,
    password: pass
  });

  if (loginError) {
    alert("Invalid password.");
    return;
  }

  localStorage.setItem("reg_no", reg);

  alert("Login Successful!");
  // Next step
  // window.location.href = "dashboard.html";
}
