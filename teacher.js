const db = window.supabase.createClient(
  "https://cfhhcmyfewvvdylqvcdg.supabase.co",
  "YOUR_PUBLISHABLE_KEY"
);

async function createAssignment() {
  const title = document.getElementById("title").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const semester = document.getElementById("semester").value;
  const deadline = document.getElementById("deadline").value;

  if (!title || !subject || !semester || !deadline) {
    alert("Fill all fields");
    return;
  }

  const { error } = await db.from("assignments").insert({
    title,
    subject,
    semester: parseInt(semester),
    deadline
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Assignment published successfully!");
  }
}
