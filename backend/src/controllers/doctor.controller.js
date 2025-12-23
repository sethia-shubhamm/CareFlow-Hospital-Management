import Doctor from "../models/doctor.model.js";
import Appointment from "../models/appointment.model.js";
import Patient from "../models/patient.model.js";
import MedicalRecord from "../models/medicalRecord.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getDoctorDashboard = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ user: userId }).populate('user', 'name');
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    // Get total unique patients
    const appointments = await Appointment.find({ doctor: doctor._id }).distinct('patient');
    const totalPatients = appointments.length;

    // Get upcoming appointments count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingAppointments = await Appointment.countDocuments({
        doctor: doctor._id,
        appointmentDate: { $gte: today },
        status: 'Scheduled'
    });

    // Get today's appointments
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.find({
        doctor: doctor._id,
        appointmentDate: { $gte: today, $lt: tomorrow }
    })
    .populate({
        path: 'patient',
        select: 'name contactNumber'
    })
    .sort({ appointmentTime: 1 });

    res.status(200).json({
        doctor: {
            name: doctor.user.name,
            specialization: doctor.specialization
        },
        totalPatients,
        upcomingAppointments,
        todayAppointments: todayAppointments.map(apt => ({
            patientName: apt.patient.name,
            patientPhone: apt.patient.contactNumber,
            appointmentTime: apt.appointmentTime,
            reason: apt.reason,
            status: apt.status
        }))
    });
});

export const getDoctorAppointments = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
        .populate({
            path: 'patient',
            select: 'name email contactNumber'
        })
        .sort({ appointmentDate: -1 });

    res.status(200).json({
        count: appointments.length,
        appointments: appointments.map(apt => ({
            _id: apt._id,
            patientName: apt.patient.name,
            patientEmail: apt.patient.email,
            patientPhone: apt.patient.contactNumber,
            appointmentDate: apt.appointmentDate,
            appointmentTime: apt.appointmentTime,
            reason: apt.reason,
            status: apt.status
        }))
    });
});

export const cancelAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    const appointment = await Appointment.findOne({ _id: appointmentId, doctor: doctor._id });
    if (!appointment) {
        res.status(404);
        throw new Error("Appointment not found");
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    res.status(200).json({
        message: "Appointment cancelled successfully",
        appointment
    });
});

export const rescheduleAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const { date, time } = req.body;
    const userId = req.user.id;

    if (!date || !time) {
        res.status(400);
        throw new Error("Please provide date and time");
    }

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    const appointment = await Appointment.findOne({ _id: appointmentId, doctor: doctor._id });
    if (!appointment) {
        res.status(404);
        throw new Error("Appointment not found");
    }

    // Check if new slot is available
    const existingAppointment = await Appointment.findOne({
        doctor: doctor._id,
        appointmentDate: date,
        appointmentTime: time,
        _id: { $ne: appointmentId }
    });

    if (existingAppointment) {
        res.status(409);
        throw new Error("This time slot is already booked");
    }

    appointment.appointmentDate = date;
    appointment.appointmentTime = time;
    await appointment.save();

    res.status(200).json({
        message: "Appointment rescheduled successfully",
        appointment
    });
});

export const getDoctorPatients = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    // Get all unique patients who have appointments with this doctor
    const appointments = await Appointment.find({ doctor: doctor._id })
        .populate('patient')
        .sort({ appointmentDate: -1 });

    // Create a map to store unique patients with their latest appointment info
    const patientMap = new Map();

    appointments.forEach(apt => {
        if (apt.patient && !patientMap.has(apt.patient._id.toString())) {
            const age = apt.patient.dateOfBirth 
                ? Math.floor((new Date() - new Date(apt.patient.dateOfBirth)) / 31557600000)
                : null;

            patientMap.set(apt.patient._id.toString(), {
                _id: apt.patient._id,
                patientId: apt.patient.patientId,
                name: apt.patient.name,
                age: age,
                gender: apt.patient.gender,
                phone: apt.patient.contactNumber,
                lastAppointment: apt.appointmentDate,
                appointmentStatus: apt.status
            });
        }
    });

    const patients = Array.from(patientMap.values());

    res.status(200).json({
        count: patients.length,
        patients
    });
});

export const getDoctorProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ user: userId })
        .populate('user', 'name email contactNumber');

    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    res.status(200).json({
        doctor: {
            name: doctor.user.name,
            email: doctor.user.email,
            phone: doctor.user.contactNumber,
            specialization: doctor.specialization,
            experience: doctor.experience,
            education: doctor.education,
            address: doctor.address,
            status: doctor.status,
            image: doctor.image
        }
    });
});

export const updateDoctorProfile = asyncHandler(async (req, res) => {
    const { name, phone, specialization, experience, education, address } = req.body;
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ user: userId }).populate('user');
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    // Update user fields
    const user = await User.findById(userId);
    if (name) user.name = name;
    if (phone) user.contactNumber = phone;
    await user.save();

    // Update doctor fields
    if (specialization) doctor.specialization = specialization;
    if (experience) doctor.experience = experience;
    if (education) doctor.education = education;
    if (address) doctor.address = address;
    await doctor.save();

    res.status(200).json({
        message: "Profile updated successfully",
        doctor: {
            name: user.name,
            email: user.email,
            phone: user.contactNumber,
            specialization: doctor.specialization,
            experience: doctor.experience,
            education: doctor.education,
            address: doctor.address,
            status: doctor.status
        }
    });
});

export const updateDoctorPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error("Please provide current password and new password");
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        res.status(401);
        throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
        message: "Password updated successfully"
    });
});

export const getDoctorMedicalRecords = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    const records = await MedicalRecord.find({ doctor: doctor._id })
        .populate('patient', 'name patientId')
        .sort({ visitDate: -1 });

    res.status(200).json({
        count: records.length,
        records: records.map(record => ({
            _id: record._id,
            patientName: record.patient.name,
            patientId: record.patient.patientId,
            title: record.title,
            recordType: record.recordType,
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            prescription: record.prescription,
            notes: record.notes,
            visitDate: record.visitDate,
            attachments: record.attachments || []
        }))
    });
});

export const addMedicalRecord = asyncHandler(async (req, res) => {
    const { patientId, title, recordType, diagnosis, treatment, prescription, notes, visitDate } = req.body;
    const userId = req.user.id;

    if (!patientId || !title || !recordType || !visitDate) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    // Handle file uploads - Upload all files in parallel for better performance
    const attachments = [];
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file) => {
            const uploadResult = await uploadOnCloudinary(file.path);
            if (uploadResult) {
                return {
                    fileName: file.originalname,
                    fileUrl: uploadResult.secure_url,
                    fileSize: `${(file.size / 1024).toFixed(2)} KB`
                };
            }
            return null;
        });
        
        const results = await Promise.all(uploadPromises);
        attachments.push(...results.filter(result => result !== null));
    }

    const medicalRecord = await MedicalRecord.create({
        patient: patientId,
        doctor: doctor._id,
        title,
        recordType,
        diagnosis: diagnosis || '',
        treatment: treatment || '',
        prescription: prescription || '',
        notes: notes || '',
        visitDate,
        description: `${diagnosis || ''} ${treatment || ''}`.trim(),
        attachments
    });

    res.status(201).json({
        message: "Medical record added successfully",
        record: medicalRecord
    });
});

export const deleteMedicalRecord = asyncHandler(async (req, res) => {
    const { recordId } = req.params;
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    const medicalRecord = await MedicalRecord.findById(recordId);
    if (!medicalRecord) {
        res.status(404);
        throw new Error("Medical record not found");
    }

    // Verify the doctor owns this record
    if (medicalRecord.doctor.toString() !== doctor._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to delete this record");
    }

    await MedicalRecord.findByIdAndDelete(recordId);

    res.status(200).json({
        message: "Medical record deleted successfully"
    });
});
