const supabase = window.supabase.createClient(
  "https://cfhhcmyfewwvdylqvcdg.supabase.co",
  "sb_publishable_54d-5PRIOoE5gQ3HtHyAUg_5N1Cjh7F"
);

// ---------- REGISTER ----------
async function registerStudent() {

  const reg = document.getElementById("reg").value.trim();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const sem = document.getElementById("semester").value;
  const pass = document.getElementById("password").value;

  if(!reg || !name || !email || !sem || !pass){
    alert("Please fill all fields");
    return;
  }

  const {error} = await supabase.auth.signUp({
      email: email,
      password: pass
  });

  if(error){
      alert(error.message);
      return;
  }

  await supabase.from("students").insert({
      reg_no: reg,
      name: name,
      email: email,
      semester: parseInt(sem)
  });

  alert("Account created! Verify your email once.");
}

// ---------- LOGIN ----------
async function loginStudent(){

  const reg = document.getElementById("loginReg").value.trim();
  const pass = document.getElementById("loginPass").value;

  const {data:student} = await supabase
      .from("students")
      .select("*")
      .eq("reg_no",reg)
      .single();

  if(!student){
      alert("Register number not found");
      return;
  }

  const {error} = await supabase.auth.signInWithPassword({
      email: student.email,
      password: pass
  });

  if(error){
      alert("Wrong password");
      return;
  }

  localStorage.setItem("reg_no",reg);
  window.location.href="dashboard.html";
}
