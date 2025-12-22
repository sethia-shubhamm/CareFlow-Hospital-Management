import dotenv from "dotenv";
import bcrypt from "bcrypt";

import User from "./src/models/user.model.js";
import Patient from "./src/models/patient.model.js";
import Doctor from "./src/models/doctor.model.js";
import Appointment from "./src/models/appointment.model.js";
import Bill from "./src/models/bill.model.js";
import MedicalRecord from "./src/models/medicalRecord.model.js";
import connectDB from "./src/db/db.js";

dotenv.config();

// 🧹 Clear old test data
const clearDB = async () => {
  await Promise.all([
    User.deleteMany(),
    Patient.deleteMany(),
    Doctor.deleteMany(),
    Appointment.deleteMany(),
    Bill.deleteMany(),
    MedicalRecord.deleteMany()
  ]);
  console.log("Database cleared");
};

// 🌱 Seed dummy data
const seedData = async () => {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // ---- PATIENT USERS - Create 11 patients (1 demo + 10 regular) ----
  const patientData = [
    { firstName: "Demo", lastName: "Patient", email: "patient@hospital.com", phone: 9999999999, dob: "1995-05-15", gender: "Male", blood: "O+", city: "Delhi" },
    { firstName: "Rahul", lastName: "Sharma", email: "rahul@test.com", phone: 9999999998, dob: "1995-05-15", gender: "Male", blood: "O+", city: "Bangalore" },
    { firstName: "Priya", lastName: "Patel", email: "priya@test.com", phone: 9888888888, dob: "1990-08-20", gender: "Female", blood: "A+", city: "Mumbai" },
    { firstName: "Amit", lastName: "Kumar", email: "amit@test.com", phone: 9777777777, dob: "1988-03-10", gender: "Male", blood: "B+", city: "Delhi" },
    { firstName: "Sneha", lastName: "Reddy", email: "sneha@test.com", phone: 9666666666, dob: "1992-11-25", gender: "Female", blood: "AB+", city: "Hyderabad" },
    { firstName: "Vikram", lastName: "Singh", email: "vikram@test.com", phone: 9555555555, dob: "1985-07-18", gender: "Male", blood: "O-", city: "Delhi" },
    { firstName: "Anjali", lastName: "Gupta", email: "anjali@test.com", phone: 9444444444, dob: "1993-02-14", gender: "Female", blood: "A-", city: "Pune" },
    { firstName: "Rohan", lastName: "Verma", email: "rohan@test.com", phone: 9333333333, dob: "1987-09-22", gender: "Male", blood: "B-", city: "Chennai" },
    { firstName: "Neha", lastName: "Kapoor", email: "neha@test.com", phone: 9222222222, dob: "1994-04-18", gender: "Female", blood: "AB-", city: "Kolkata" },
    { firstName: "Arjun", lastName: "Nair", email: "arjun@test.com", phone: 9111111111, dob: "1989-06-30", gender: "Male", blood: "O+", city: "Kochi" },
    { firstName: "Divya", lastName: "Iyer", email: "divya@test.com", phone: 9000000000, dob: "1991-12-05", gender: "Female", blood: "A+", city: "Bangalore" }
  ];

  const patients = await Promise.all(patientData.map(async (data) => {
    const user = await User.create({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phoneNumber: data.phone,
      password: hashedPassword,
      role: "patient"
    });

    const patientCount = await Patient.countDocuments();
    const patientId = `PAT${String(patientCount + 1).padStart(5, "0")}`;

    return await Patient.create({
      user: user._id,
      patientId,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      dateOfBirth: new Date(data.dob),
      age: new Date().getFullYear() - new Date(data.dob).getFullYear(),
      gender: data.gender,
      contactNumber: data.phone,
      bloodType: data.blood,
      address: `${Math.floor(Math.random() * 1000)} ${data.city} Street, ${data.city}`,
      medicalHistory: Math.random() > 0.5 ? ["Hypertension"] : [],
      emergencyContact: {
        name: `Emergency Contact for ${data.firstName}`,
        emergencyPhone: data.phone - 1
      }
    });
  }));

  console.log(`✅ Created ${patients.length} patients`);

  // ---- DOCTOR USERS - Create 6 doctors ----
  const maleImage = "/doctorImages/male.png";
  const femaleImage = "/doctorImages/female-296990_1280.png";
  
  const doctorData = [
    { firstName: "Arjun", lastName: "Mehta", email: "arjun.mehta@hospital.com", phone: 8888888888, specialization: "Cardiology", experience: 10, image: maleImage, gender: "male" },
    { firstName: "Sarah", lastName: "D'Souza", email: "sarah.dsouza@hospital.com", phone: 8777777777, specialization: "Orthopedics", experience: 8, image: femaleImage, gender: "female" },
    { firstName: "Rajesh", lastName: "Iyer", email: "rajesh.iyer@hospital.com", phone: 8666666666, specialization: "General Medicine", experience: 15, image: maleImage, gender: "male" },
    { firstName: "Priya", lastName: "Chatterjee", email: "priya.chatterjee@hospital.com", phone: 8555555555, specialization: "Pediatrics", experience: 7, image: femaleImage, gender: "female" },
    { firstName: "Vikram", lastName: "Patel", email: "vikram.patel@hospital.com", phone: 8444444444, specialization: "Dermatology", experience: 6, image: maleImage, gender: "male" },
    { firstName: "Neha", lastName: "Singh", email: "neha.singh@hospital.com", phone: 8333333333, specialization: "ENT", experience: 9, image: femaleImage, gender: "female" }
  ];

  const doctors = await Promise.all(doctorData.map(async (data) => {
    const user = await User.create({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phoneNumber: data.phone,
      password: hashedPassword,
      role: "doctor"
    });

    return await Doctor.create({
      user: user._id,
      specialization: data.specialization,
      experience: data.experience,
      education: `MBBS, MD (${data.specialization}) from AIIMS`,
      address: `Apollo Hospital, New Delhi`,
      status: "Active",
      image: data.image
    });
  }));

  console.log(`✅ Created ${doctors.length} doctors`);

  // ---- ADMIN USERS - Create 2 admins ----
  const adminData = [
    { firstName: "Admin", lastName: "Super", email: "admin@hospital.com", phone: 9876543210 },
    { firstName: "Manager", lastName: "Hospital", email: "manager@hospital.com", phone: 9876543211 }
  ];

  const admins = await Promise.all(adminData.map(async (data) => {
    return await User.create({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phoneNumber: data.phone,
      password: hashedPassword,
      role: "admin"
    });
  }));

  console.log(`✅ Created ${admins.length} admins`);

  // ---- CREATE DATES FOR APPOINTMENTS ----
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  // ---- CREATE 30+ APPOINTMENTS ----
  // ---- CREATE APPOINTMENTS ----
  const reasons = [
    "Routine checkup",
    "Follow-up consultation",
    "Diagnosis discussion",
    "Medication review",
    "Test results discussion",
    "Urgent consultation",
    "Annual screening",
    "Pain management"
  ];

  const times = ["09:00 AM", "10:00 AM", "10:30 AM", "11:00 AM", "02:00 PM", "03:00 PM", "03:30 PM", "04:00 PM"];

  let appointmentCount = 0;

  // Get demo patient and demo doctor
  const demoPatient = patients[0]; // Demo Patient (patient@hospital.com)
  const demoDoctor = doctors[0]; // Arjun Mehta (arjun.mehta@hospital.com)

  // Create appointments for demo patient with demo doctor
  // Today
  await Appointment.create({
    patient: demoPatient._id,
    doctor: demoDoctor._id,
    appointmentDate: today,
    appointmentTime: "10:00 AM",
    reason: "Routine checkup",
    status: "Scheduled"
  });
  appointmentCount++;

  // Tomorrow
  await Appointment.create({
    patient: demoPatient._id,
    doctor: demoDoctor._id,
    appointmentDate: tomorrow,
    appointmentTime: "02:00 PM",
    reason: "Follow-up consultation",
    status: "Scheduled"
  });
  appointmentCount++;

  // Next week
  await Appointment.create({
    patient: demoPatient._id,
    doctor: demoDoctor._id,
    appointmentDate: nextWeek,
    appointmentTime: "11:00 AM",
    reason: "Test results discussion",
    status: "Scheduled"
  });
  appointmentCount++;

  // Past completed appointment for demo patient
  const demoCompletedAppointment = await Appointment.create({
    patient: demoPatient._id,
    doctor: demoDoctor._id,
    appointmentDate: yesterday,
    appointmentTime: "03:00 PM",
    reason: "Annual screening",
    status: "Completed"
  });
  appointmentCount++;

  // Create appointments for today (3-5 appointments)
  for (let i = 1; i < 4; i++) {
    await Appointment.create({
      patient: patients[i]._id,
      doctor: doctors[i % doctors.length]._id,
      appointmentDate: today,
      appointmentTime: times[i],
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      status: "Scheduled"
    });
    appointmentCount++;
  }

  // Create appointments for upcoming dates
  for (let d = 1; d <= 14; d++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(appointmentDate.getDate() + d);

    for (let i = 0; i < 2; i++) {
      const patientIndex = Math.floor(Math.random() * (patients.length - 1)) + 1; // Skip demo patient
      const doctorIndex = Math.floor(Math.random() * doctors.length);
      
      await Appointment.create({
        patient: patients[patientIndex]._id,
        doctor: doctors[doctorIndex]._id,
        appointmentDate: appointmentDate,
        appointmentTime: times[Math.floor(Math.random() * times.length)],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status: "Scheduled"
      });
      appointmentCount++;
    }
  }

  // Create completed appointments from past
  for (let d = 1; d <= 7; d++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(appointmentDate.getDate() - d);

    for (let i = 0; i < 2; i++) {
      const patientIndex = Math.floor(Math.random() * (patients.length - 1)) + 1; // Skip demo patient
      const doctorIndex = Math.floor(Math.random() * doctors.length);
      
      await Appointment.create({
        patient: patients[patientIndex]._id,
        doctor: doctors[doctorIndex]._id,
        appointmentDate: appointmentDate,
        appointmentTime: times[Math.floor(Math.random() * times.length)],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status: Math.random() > 0.3 ? "Completed" : "Cancelled"
      });
      appointmentCount++;
    }
  }

  console.log(`✅ Created ${appointmentCount} appointments`);

  // ---- CREATE BILLS ----
  // Create bills specifically for demo patient
  await Bill.create({
    patient: demoPatient._id,
    appointment: demoCompletedAppointment._id,
    amount: 1500,
    description: "Annual screening - Consultation fee",
    billType: "Consultation",
    paymentStatus: "Paid",
    paymentMethod: "Card",
    paymentDate: yesterday,
    dueDate: new Date(yesterday.getTime() + 7 * 24 * 60 * 60 * 1000)
  });

  await Bill.create({
    patient: demoPatient._id,
    appointment: demoCompletedAppointment._id,
    amount: 800,
    description: "Lab tests - Blood work",
    billType: "Lab",
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    paymentDate: yesterday,
    dueDate: new Date(yesterday.getTime() + 7 * 24 * 60 * 60 * 1000)
  });

  await Bill.create({
    patient: demoPatient._id,
    appointment: null,
    amount: 2500,
    description: "Medication refill - Monthly prescription",
    billType: "Procedure",
    paymentStatus: "Unpaid",
    paymentMethod: null,
    paymentDate: null,
    dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  });

  let billCount = 3;

  // Create bills for other patients from completed appointments
  const allAppointments = await Appointment.find();

  for (let i = 0; i < Math.min(12, allAppointments.length); i++) {
    const appointment = allAppointments[i];
    
    if (appointment.status === "Completed" && Math.random() > 0.3 && String(appointment.patient) !== String(demoPatient._id)) {
      await Bill.create({
        patient: appointment.patient,
        appointment: appointment._id,
        amount: 500 + Math.random() * 2500,
        description: `Consultation fee - ${appointment.reason}`,
        billType: ["Consultation", "Lab", "Procedure"][Math.floor(Math.random() * 3)],
        paymentStatus: ["Paid", "Unpaid", "Partially Paid"][Math.floor(Math.random() * 3)],
        paymentMethod: ["Cash", "Card", "UPI", "Net Banking"][Math.floor(Math.random() * 4)],
        paymentDate: appointment.appointmentDate,
        dueDate: new Date(appointment.appointmentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      });
      billCount++;
    }
  }

  console.log(`✅ Created ${billCount} bills`);

  // ---- CREATE MEDICAL RECORDS ----
  // Create medical records specifically for demo patient
  await MedicalRecord.create({
    patient: demoPatient._id,
    doctor: demoDoctor._id,
    title: `Annual Screening - ${new Date().toLocaleDateString()}`,
    description: `Comprehensive annual health screening and medical examination`,
    recordType: "Consultation",
    diagnosis: "Patient in good overall health. No acute conditions detected.",
    treatment: "Continue current lifestyle. Regular exercise recommended.",
    prescription: "Multivitamin supplements once daily. Vitamin D 1000IU recommended.",
    notes: "Patient to follow up in 6 months for routine checkup. Maintain healthy diet and exercise.",
    visitDate: yesterday,
    attachments: []
  });

  await MedicalRecord.create({
    patient: demoPatient._id,
    doctor: demoDoctor._id,
    title: `Blood Work Results - ${new Date(yesterday).toLocaleDateString()}`,
    description: `Lab report and blood test analysis`,
    recordType: "Lab Report",
    diagnosis: "Blood work shows normal values. No abnormalities detected.",
    treatment: "No treatment required. Continue with regular health monitoring.",
    prescription: "Continue current dietary habits. Stay hydrated.",
    notes: "All parameters within normal range. Follow-up testing in 12 months.",
    visitDate: yesterday,
    attachments: []
  });

  let recordCount = 2;

  // Create medical records for other patients from completed appointments
  for (let i = 0; i < Math.min(13, allAppointments.length); i++) {
    const appointment = allAppointments[i];
    
    if (appointment.status === "Completed" && String(appointment.patient) !== String(demoPatient._id)) {
      await MedicalRecord.create({
        patient: appointment.patient,
        doctor: appointment.doctor,
        title: `${appointment.reason} - ${new Date(appointment.appointmentDate).toLocaleDateString()}`,
        description: `Medical record for patient appointment on ${appointment.appointmentDate.toLocaleDateString()}`,
        recordType: ["Consultation", "Lab Report", "X-Ray", "ECG", "Prescription"][Math.floor(Math.random() * 5)],
        diagnosis: "Condition assessed and documented",
        treatment: "Treatment plan discussed with patient",
        prescription: "Medications prescribed as needed",
        notes: "Follow-up required if symptoms persist",
        visitDate: appointment.appointmentDate,
        attachments: []
      });
      recordCount++;
    }
  }

  console.log(`✅ Created ${recordCount} medical records`);

  console.log("\n✅ CareFlow Database Data Seeded!");
  console.log("📊 Summary:");
  console.log(`   - ${patients.length} Patients with varying medical histories`);
  console.log(`   - ${doctors.length} Doctors across different specializations`);
  console.log(`   - ${admins.length} Admins for system management`);
  console.log(`   - ${appointmentCount} Appointments (scheduled, completed, cancelled)`);
  console.log(`   - ${billCount} Bills with different payment statuses`);
  console.log(`   - ${recordCount} Medical Records linked to appointments`);
  console.log("\n🔐 Login Credentials:");
  console.log("   Demo Patient: patient@hospital.com / patient123");
  console.log("   Demo Doctor: arjun.mehta@hospital.com / password123");
  console.log("   Demo Admin: admin@hospital.com / password123");
  console.log("\n   Other Patient: rahul@test.com / password123");
  console.log("   Manager Admin: manager@hospital.com / password123");
  console.log("\n📅 Data includes:");
  console.log("   - Today's appointments");
  console.log("   - Upcoming appointments (next 14 days)");
  console.log("   - Past completed/cancelled appointments");
  console.log("   - Various medical record types");
  console.log("   - Different payment statuses on bills");
};

// 🚀 Run seed
const run = async () => {
  try {
    await connectDB();
    await clearDB(); // comment if you don’t want wipe
    await seedData();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
