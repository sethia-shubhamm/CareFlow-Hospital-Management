import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Bill from "../models/bill.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get Admin Stats
export const getStats = asyncHandler(async (req, res) => {
  const totalDoctors = await Doctor.countDocuments();
  const totalPatients = await Patient.countDocuments();
  const totalAppointments = await Appointment.countDocuments();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = await Appointment.countDocuments({
    appointmentDate: { $gte: today, $lt: tomorrow }
  });

  const bills = await Bill.aggregate([
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
  ]);
  const totalRevenue = bills.length > 0 ? bills[0].totalRevenue : 0;

  res.json({
    stats: {
      totalDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
      totalRevenue
    }
  });
});

// Get Recent Activities
export const getRecentActivities = asyncHandler(async (req, res) => {
  const activities = [];

  // Get recent doctor signups
  const doctors = await Doctor.find().sort({ createdAt: -1 }).limit(5).populate("user", "name");
  doctors.forEach(doc => {
    const doctorName = doc.user?.name || "Unknown";
    activities.push({
      type: "doctor_signup",
      description: `Dr. ${doctorName} registered as ${doc.specialization}`,
      time: doc.createdAt || new Date(),
      icon: "👨‍⚕️"
    });
  });

  // Get recent patient signups
  const patients = await Patient.find().sort({ createdAt: -1 }).limit(5).populate("user", "name");
  patients.forEach(pat => {
    const patientName = pat.user?.name || pat.name || "Unknown";
    activities.push({
      type: "patient_signup",
      description: `${patientName} registered as a patient`,
      time: pat.createdAt || new Date(),
      icon: "👤"
    });
  });

  // Get recent appointments
  const appointments = await Appointment.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({
      path: "patient",
      select: "name"
    })
    .populate({
      path: "doctor",
      select: "user",
      populate: { path: "user", select: "name" }
    });

  appointments.forEach(app => {
    const doctorName = app.doctor?.user?.name || "Unknown";
    const patientName = app.patient?.name || "Unknown";
    activities.push({
      type: "appointment_created",
      description: `Appointment: ${patientName} with Dr. ${doctorName}`,
      time: app.createdAt || new Date(),
      icon: "📅"
    });
  });

  // Sort by time and return top 10
  const sortedActivities = activities
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 10);

  res.json({
    activities: sortedActivities
  });
});

// Get Today's Appointments
export const getTodayAppointments = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointments = await Appointment.find({
    appointmentDate: { $gte: today, $lt: tomorrow }
  })
    .populate("patient", "name")
    .populate({
      path: "doctor",
      select: "user",
      populate: { path: "user", select: "name" }
    })
    .sort({ appointmentTime: 1 })
    .limit(5);

  const formattedAppointments = appointments.map(app => {
    const doctorName = app.doctor?.user?.name || "Unknown";
    return {
      _id: app._id,
      patientName: app.patient?.name || "Unknown",
      doctorName,
      appointmentDate: app.appointmentDate,
      appointmentTime: app.appointmentTime,
      reason: app.reason,
      status: app.status
    };
  });

  res.json({
    appointments: formattedAppointments
  });
});

// Get Top Doctors
export const getTopDoctors = asyncHandler(async (req, res) => {
  const topDoctors = await Appointment.aggregate([
    {
      $group: {
        _id: "$doctor",
        patientCount: { $sum: 1 }
      }
    },
    { $sort: { patientCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "doctors",
        localField: "_id",
        foreignField: "_id",
        as: "doctorInfo"
      }
    }
  ]);

  // Fetch user details for each doctor
  const doctorsWithUsers = await Promise.all(
    topDoctors.map(async (item) => {
      const doctorInfo = item.doctorInfo[0];
      const user = doctorInfo?.user ? await User.findById(doctorInfo.user) : null;
      return {
        _id: item._id,
        name: user?.name || "Unknown",
        specialization: doctorInfo?.specialization || "N/A",
        patientCount: item.patientCount
      };
    })
  );

  res.json({
    doctors: doctorsWithUsers
  });
});

// DOCTORS MANAGEMENT

// Get All Doctors
export const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  
  const formattedDoctors = doctors.map(doc => ({
    _id: doc._id,
    name: doc.user?.name || "Unknown",
    email: doc.user?.email || "",
    phone: doc.user?.phoneNumber || "",
    specialization: doc.specialization,
    experience: doc.experience,
    education: doc.education,
    address: doc.address,
    status: doc.status
  }));
  
  res.json({
    doctors: formattedDoctors
  });
});

// Create Doctor
export const createDoctor = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, specialization, experience, education, address, status } = req.body;

  if (!firstName || !lastName || !email || !phone || !specialization) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already exists");
  }

  // Create user first
  const user = new User({
    firstName,
    lastName,
    email,
    phone,
    role: "Doctor"
  });
  await user.save();

  // Create doctor with user reference
  const doctor = new Doctor({
    user: user._id,
    specialization,
    experience: experience || 0,
    education: education || "",
    address: address || "",
    status: status || "Active"
  });

  await doctor.save();
  
  const populatedDoctor = await doctor.populate("user", "firstName lastName email");
  
  res.status(201).json({
    _id: populatedDoctor._id,
    name: `${populatedDoctor.user.firstName} ${populatedDoctor.user.lastName}`,
    email: populatedDoctor.user.email,
    specialization: populatedDoctor.specialization,
    experience: populatedDoctor.experience,
    education: populatedDoctor.education,
    address: populatedDoctor.address,
    status: populatedDoctor.status
  });
});

// Update Doctor Status
export const updateDoctorStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const doctor = await Doctor.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).populate("user", "firstName lastName email");

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  res.json({
    _id: doctor._id,
    name: `${doctor.user.firstName} ${doctor.user.lastName}`,
    email: doctor.user.email,
    specialization: doctor.specialization,
    experience: doctor.experience,
    education: doctor.education,
    address: doctor.address,
    status: doctor.status
  });
});

// Delete Doctor
export const deleteDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doctor = await Doctor.findByIdAndDelete(id);
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  // Also delete the associated user
  if (doctor.user) {
    await User.findByIdAndDelete(doctor.user);
  }

  res.json({ message: "Doctor deleted successfully" });
});

// PATIENTS MANAGEMENT

// Get All Patients
export const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find()
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 });

  const formattedPatients = patients.map(pat => ({
    _id: pat._id,
    patientId: pat.patientId,
    name: pat.name || (pat.user ? `${pat.user.firstName} ${pat.user.lastName}` : "Unknown"),
    email: pat.email || pat.user?.email || "",
    age: pat.age,
    gender: pat.gender,
    bloodType: pat.bloodType,
    contactNumber: pat.contactNumber
  }));

  res.json({
    patients: formattedPatients
  });
});

// Create Patient
export const createPatient = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, dateOfBirth, gender, contactNumber, bloodType, address } = req.body;

  if (!firstName || !lastName || !email) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const existingPatient = await Patient.findOne({ email });
  if (existingPatient) {
    res.status(400);
    throw new Error("Patient with this email already exists");
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  let user = existingUser;
  
  if (!user) {
    user = new User({
      firstName,
      lastName,
      email,
      phoneNumber: contactNumber || "",
      role: "patient"
    });
    await user.save();
  }

  // Generate patient ID
  const patientCount = await Patient.countDocuments();
  const patientId = `PAT${String(patientCount + 1).padStart(5, "0")}`;

  const patient = new Patient({
    user: user._id,
    patientId,
    name: `${firstName} ${lastName}`,
    email,
    dateOfBirth,
    gender: gender || "Other",
    contactNumber: contactNumber || "",
    bloodType: bloodType || "O+",
    address: address || ""
  });

  await patient.save();
  
  res.status(201).json({
    _id: patient._id,
    patientId: patient.patientId,
    name: patient.name,
    email: patient.email,
    age: patient.age,
    gender: patient.gender,
    bloodType: patient.bloodType,
    contactNumber: patient.contactNumber
  });
});

// Delete Patient
export const deletePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const patient = await Patient.findByIdAndDelete(id);
  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  // Also delete the associated user if exists
  if (patient.user) {
    await User.findByIdAndDelete(patient.user);
  }

  res.json({ message: "Patient deleted successfully" });
});

// APPOINTMENTS MANAGEMENT

// Get All Appointments
export const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate("patient", "name")
    .populate({
      path: "doctor",
      select: "user",
      populate: { path: "user", select: "name" }
    })
    .sort({ appointmentDate: -1 });

  const formattedAppointments = appointments.map(app => {
    const doctorName = app.doctor?.user?.name || "Unknown";
    return {
      _id: app._id,
      patientName: app.patient?.name || "Unknown",
      doctorName,
      appointmentDate: app.appointmentDate,
      appointmentTime: app.appointmentTime,
      reason: app.reason,
      status: app.status
    };
  });

  res.json({
    appointments: formattedAppointments
  });
});

// Cancel Appointment
export const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await Appointment.findByIdAndUpdate(
    id,
    { status: "Cancelled" },
    { new: true }
  );

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  res.json(appointment);
});

// Generate Bill
export const generateBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, billType, paymentStatus, paymentMethod, description } = req.body;

  const appointment = await Appointment.findById(id)
    .populate("patient", "name")
    .populate({
      path: "doctor",
      select: "user",
      populate: { path: "user", select: "firstName lastName" }
    });

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (appointment.status !== "Completed") {
    res.status(400);
    throw new Error("Can only generate bills for completed appointments");
  }

  // Check if bill already exists
  const existingBill = await Bill.findOne({ appointment: id });
  if (existingBill) {
    res.status(400);
    throw new Error("Bill already exists for this appointment");
  }

  // Create new bill with custom data
  const bill = new Bill({
    appointment: appointment._id,
    patient: appointment.patient._id,
    amount: amount || 500,
    description: description || `Consultation for ${appointment.reason}`,
    billType: billType || "Consultation",
    paymentStatus: paymentStatus || "Unpaid",
    paymentMethod: paymentMethod || "",
    paymentDate: new Date()
  });

  await bill.save();

  const doctorName = appointment.doctor?.user?.name || "Unknown";

  res.status(201).json({
    message: "Bill generated successfully",
    bill: {
      _id: bill._id,
      patientName: appointment.patient?.name,
      doctorName,
      amount: bill.amount,
      billType: bill.billType,
      paymentStatus: bill.paymentStatus,
      createdAt: bill.createdAt
    }
  });
});
