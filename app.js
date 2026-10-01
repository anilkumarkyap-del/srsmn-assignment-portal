// =======================================
// EduAssign - Supabase Connection
// =======================================

const db = window.supabase.createClient(
  "https://cfhhcmyfewvvdylqvcdg.supabase.co",
  "sb_publishable_54d-5PRIOoE5gQ3HtHyAUg_5N1Cjh7F"
);


// =======================================
// REGISTER STUDENT
// =======================================

async function registerStudent() {

  const reg =
    document.getElementById("reg").value.trim();

  const name =
    document.getElementById("name").value.trim();

  const email =
    document.getElementById("email").value.trim();

  const sem =
    document.getElementById("semester").value;

  const pass =
    document.getElementById("password").value;

  const confirm =
    document.getElementById("confirmPassword").value;


  if (
    !reg ||
    !name ||
    !email ||
    !sem ||
    !pass ||
    !confirm
  ) {

    alert("Please fill all fields.");
    return;
  }


  if (pass !== confirm) {

    alert("Passwords do not match.");
    return;
  }


  const {
    error: authError
  } = await db.auth.signUp({

    email: email,
    password: pass

  });


  if (authError) {

    alert(authError.message);
    return;
  }


  const {
    error: dbError
  } = await db
    .from("students")
    .insert({

      reg_no: reg,
      name: name,
      email: email,
      semester: Number(sem)

    });


  if (dbError) {

    alert(dbError.message);
    return;
  }


  alert(
    "Account created successfully!"
  );

  showLogin();
}


// =======================================
// STUDENT LOGIN
// =======================================

async function loginStudent() {

  const reg =
    document.getElementById("loginReg")
      .value
      .trim();

  const pass =
    document.getElementById("loginPass")
      .value;


  const {
    data: student,
    error
  } = await db
    .from("students")
    .select("*")
    .eq("reg_no", reg)
    .single();


  if (error || !student) {

    alert(
      "Register Number not found."
    );

    return;
  }


  const {
    error: loginError
  } = await db.auth.signInWithPassword({

    email: student.email,
    password: pass

  });


  if (loginError) {

    alert("Invalid password.");
    return;
  }


  localStorage.setItem(
    "reg_no",
    reg
  );

  localStorage.setItem(
    "semester",
    student.semester
  );


  window.location.href =
    "dashboard.html";
}


// =======================================
// CREATE ASSIGNMENT
// =======================================

async function createAssignment() {

  // ---------------------------------------
  // REQUIRED FIELDS
  // ---------------------------------------

  const title =
    document.getElementById("title")
      .value
      .trim();

  const subject =
    document.getElementById("subject")
      .value
      .trim();

  const semester =
    document.getElementById("semester")
      .value;

  const due =
    document.getElementById("due")
      .value;


  // ---------------------------------------
  // OPTIONAL QUESTION FIELDS
  // ---------------------------------------

  const questionTextElement =
    document.getElementById(
      "questionText"
    );

  const questionPdfElement =
    document.getElementById(
      "questionPdf"
    );


  const questionText =
    questionTextElement
      ? questionTextElement.value.trim()
      : "";


  let questionPdf = null;


  if (
    questionPdfElement &&
    questionPdfElement.files &&
    questionPdfElement.files.length > 0
  ) {

    questionPdf =
      questionPdfElement.files[0];

  }


  // ---------------------------------------
  // CHECK REQUIRED FIELDS
  // ---------------------------------------

  if (
    !title ||
    !subject ||
    !semester ||
    !due
  ) {

    alert(
      "Please fill all required fields."
    );

    return;
  }


  // ---------------------------------------
  // CHECK QUESTION PDF
  // ---------------------------------------

  if (questionPdf) {

    if (
      questionPdf.type !==
      "application/pdf"
    ) {

      alert(
        "Question file must be a PDF."
      );

      return;
    }


    // Maximum 10 MB

    if (
      questionPdf.size >
      10 * 1024 * 1024
    ) {

      alert(
        "Question PDF must be 10 MB or smaller."
      );

      return;
    }

  }


  // ---------------------------------------
  // CREATE ASSIGNMENT RECORD
  // ---------------------------------------

  const {
    data: assignment,
    error
  } = await db
    .from("assignments")
    .insert({

      title: title,

      subject: subject,

      semester:
        Number(semester),

      due_date: due,

      question_text:
        questionText || null

    })
    .select()
    .single();


  if (error) {

    alert(
      "Unable to create assignment:\n\n" +
      error.message
    );

    return;
  }


  // ---------------------------------------
  // UPLOAD QUESTION PDF
  // ---------------------------------------

  if (questionPdf) {

    const safeName =
      questionPdf.name
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );


    const filePath =
      "questions/" +
      assignment.id +
      "_" +
      Date.now() +
      "_" +
      safeName;


    const {
      error: uploadError
    } = await db
      .storage
      .from("assignments")
      .upload(

        filePath,

        questionPdf,

        {
          contentType:
            "application/pdf",

          upsert: false
        }

      );


    // ---------------------------------------
    // PDF UPLOAD FAILED
    // ---------------------------------------

    if (uploadError) {

      // Remove assignment record
      // because PDF upload failed

      await db
        .from("assignments")
        .delete()
        .eq(
          "id",
          assignment.id
        );


      alert(
        "Question PDF upload failed:\n\n" +
        uploadError.message
      );

      return;
    }


    // ---------------------------------------
    // SAVE PDF PATH
    // ---------------------------------------

    const {
      error: updateError
    } = await db
      .from("assignments")
      .update({

        question_pdf_url:
          filePath

      })
      .eq(
        "id",
        assignment.id
      );


    // ---------------------------------------
    // DATABASE UPDATE FAILED
    // ---------------------------------------

    if (updateError) {

      // Remove uploaded PDF

      await db
        .storage
        .from("assignments")
        .remove([
          filePath
        ]);


      // Remove assignment record

      await db
        .from("assignments")
        .delete()
        .eq(
          "id",
          assignment.id
        );


      alert(
        "Question PDF information could not be saved:\n\n" +
        updateError.message
      );

      return;
    }

  }


  // ---------------------------------------
  // SUCCESS
  // ---------------------------------------

  alert(
    "Assignment Published Successfully!"
  );


  // Clear required fields

  document.getElementById(
    "title"
  ).value = "";


  document.getElementById(
    "subject"
  ).value = "";


  document.getElementById(
    "semester"
  ).value = "";


  document.getElementById(
    "due"
  ).value = "";


  // Clear optional question text

  if (questionTextElement) {

    questionTextElement.value =
      "";

  }


  // Clear optional PDF

  if (questionPdfElement) {

    questionPdfElement.value =
      "";

  }

}
