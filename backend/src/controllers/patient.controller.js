import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Bill from "../models/bill.model.js";
import MedicalRecord from "../models/medicalRecord.model.js";
import Doctor from "../models/doctor.model.js"; // needed for populate
import User from "../models/user.model.js";
import ChatHistory from "../models/chatHistory.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";

export const getPatientDashboard = asyncHandler(async (req, res) => {
    const patientId = req.user.id;

    const patient = await Patient.findOne({ user: patientId });
    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    const latestAppointment = await Appointment.findOne({ patient: patient._id })
        .sort({ appointmentDate: -1 })
        .select("appointmentDate appointmentTime reason doctor")
        .populate({
            path: "doctor",
            populate: {
                path: "user",
                select: "name"
            }
        });

    const latestBill = await Bill.findOne({ patient: patient._id })
        .sort({ createdAt: -1 });

    const latestMedicalRecord = await MedicalRecord.findOne({ patient: patient._id }).populate({
        path: "doctor",
        populate: {
            path: "user",
            select: "name"
        }
    }).sort({ visitDate: -1 });

    res.status(200).json({
        patient: {
            name: patient.name
        },
        latestAppointment: latestAppointment
            ? {
                doctorName: latestAppointment.doctor.user.name,
                date: latestAppointment.appointmentDate,
                time: latestAppointment.appointmentTime,
                reason: latestAppointment.reason
            }
            : null,
        latestBill: latestBill ? { amount: latestBill.amount, status: latestBill.paymentStatus, issuedAt: latestBill.createdAt } : null,
        latestMedicalRecord: latestMedicalRecord ? { doctorName: latestMedicalRecord.doctor.user.name, visitDate: latestMedicalRecord.visitDate, title: latestMedicalRecord.title, description: latestMedicalRecord.description } : null
    });
});

export const getPatientProfile = asyncHandler(async (req, res) => {
    const patientId = req.user.id;

    const patient = await Patient.findOne({ user: patientId }).select("-__v -createdAt -updatedAt -user ");
    const user = await User.findById(patientId).select("profileImage");

    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    res.status(200).json({ 
        patient: {
            ...patient.toObject(),
            profileImage: user?.profileImage
        }
    });
});

export const getPatientAppointments = asyncHandler(async (req, res) => {
    const patientId = req.user.id;
    const patient = await Patient.findOne({ user: patientId });

    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    const appointments = await Appointment.find({ patient: patient._id })
        .populate({ path: "doctor", populate: { path: "user", select: "name specialization" } })
        .sort({ appointmentDate: -1 });

    res.status(200).json({
        count: appointments.length,
        appointments: appointments.map(app => ({
            doctorName: app.doctor.user.name,
            specialization: app.doctor.specialization,
            appointmentDate: app.appointmentDate,
            appointmentTime: app.appointmentTime,
            reason: app.reason,
            status: app.status,
            doctorImage: app.doctor.image
        }))
    });
});

export const getMedicalRecords = asyncHandler(async (req, res) => {
    const patientId = req.user.id;
    const patient = await Patient.findOne({ user: patientId });

    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    const medicalRecords = await MedicalRecord.find({ patient: patient._id })
        .populate({ path: "doctor", populate: { path: "user", select: "name specialization" } })
        .sort({ visitDate: -1 });
    res.status(200).json({
        count: medicalRecords.length,
        records: medicalRecords.map(record => ({
            doctorName: record.doctor.user.name,
            specialization: record.doctor.specialization,
            visitDate: record.visitDate,
            title: record.title,
            description: record.description,
            recordType: record.recordType,
            attachments: record.attachments
        }))
    });
});

export const getBills = asyncHandler(async (req, res) => {
    const patientId = req.user.id;
    const patient = await Patient.findOne({ user: patientId });

    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    const bills = await Bill.find({ patient: patient._id }).sort({ createdAt: -1 });

    res.status(200).json({
        count: bills.length,
        bills: bills.map(bill => ({
            amount: bill.amount,
            description: bill.description,
            billType: bill.billType,
            paymentStatus: bill.paymentStatus,
            paymentMethod: bill.paymentMethod,
            createdAt: bill.createdAt,
            paymentDate: bill.paymentDate,
            dueDate: bill.dueDate
        }))
    });
});
export const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find({ status: "Active" })
        .populate({ path: "user", select: "name email contactNumber" })
        .select("specialization experience education address status image");

    res.status(200).json({
        count: doctors.length,
        doctors: doctors.map(doctor => ({
            id: doctor._id,
            name: doctor.user.name,
            email: doctor.user.email,
            phone: doctor.user.contactNumber,
            specialization: doctor.specialization,
            experience: doctor.experience,
            education: doctor.education,
            address: doctor.address,
            status: doctor.status,
            image: doctor.image
        }))
    });
});

export const bookAppointment = asyncHandler(async (req, res) => {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !appointmentDate || !appointmentTime) {
        res.status(400);
        throw new Error("Please provide all required fields: doctorId, appointmentDate, appointmentTime");
    }

    const patient = await Patient.findOne({ user: patientId });
    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    // Check if appointment slot already exists
    const existingAppointment = await Appointment.findOne({
        doctor: doctorId,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime
    });

    if (existingAppointment) {
        res.status(409);
        throw new Error("This time slot is already booked");
    }

    const appointment = await Appointment.create({
        patient: patient._id,
        doctor: doctorId,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        reason: reason || "General Checkup",
        status: "Scheduled"
    });

    res.status(201).json({
        message: "Appointment booked successfully",
        appointment: {
            id: appointment._id,
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
            reason: appointment.reason,
            status: appointment.status
        }
    });
});

export const updatePatientProfile = asyncHandler(async (req, res) => {
    const { name, contactNumber, address, dateOfBirth, gender, bloodType, medicalHistory } = req.body;
    const patientId = req.user.id;

    const patient = await Patient.findOne({ user: patientId });
    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    // Update patient fields
    if (name) patient.name = name;
    if (contactNumber) patient.contactNumber = contactNumber;
    if (address) patient.address = address;
    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (gender) patient.gender = gender;
    if (bloodType) patient.bloodType = bloodType;
    if (medicalHistory) patient.medicalHistory = medicalHistory;

    await patient.save();

    res.status(200).json({
        message: "Profile updated successfully",
        patient: {
            name: patient.name,
            email: patient.email,
            contactNumber: patient.contactNumber,
            address: patient.address,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            bloodType: patient.bloodType,
            medicalHistory: patient.medicalHistory,
            patientId: patient.patientId,
            emergencyContact: patient.emergencyContact
        }
    });
});

export const updatePatientPassword = asyncHandler(async (req, res) => {
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

export const updateEmergencyContact = asyncHandler(async (req, res) => {
    const { emergencyName, emergencyPhone } = req.body;
    const patientId = req.user.id;

    if (!emergencyName || !emergencyPhone) {
        res.status(400);
        throw new Error("Please provide emergency contact name and phone");
    }

    const patient = await Patient.findOne({ user: patientId });
    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    patient.emergencyContact = {
        name: emergencyName,
        emergencyPhone: emergencyPhone
    };

    await patient.save();

    res.status(200).json({
        message: "Emergency contact updated successfully",
        patient: {
            name: patient.name,
            email: patient.email,
            contactNumber: patient.contactNumber,
            address: patient.address,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            bloodType: patient.bloodType,
            medicalHistory: patient.medicalHistory,
            patientId: patient.patientId,
            emergencyContact: patient.emergencyContact
        }
    });
});

export const uploadProfileImage = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
        res.status(400);
        throw new Error("Please provide an image file");
    }

    // In production, you'd upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll store the file path
    const imageUrl = `/uploads/profile-images/${req.file.filename}`;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    user.profileImage = imageUrl;
    await user.save();

    const patient = await Patient.findOne({ user: userId });

    res.status(200).json({
        message: "Profile image uploaded successfully",
        patient: {
            name: patient.name,
            email: patient.email,
            contactNumber: patient.contactNumber,
            address: patient.address,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            bloodType: patient.bloodType,
            medicalHistory: patient.medicalHistory,
            patientId: patient.patientId,
            emergencyContact: patient.emergencyContact,
            profileImage: imageUrl
        }
    });
});

export const downloadAttachment = asyncHandler(async (req, res) => {
    const { fileUrl } = req.query;

    if (!fileUrl) {
        res.status(400);
        throw new Error("File URL is required");
    }

    try {
        // Fetch the file from Cloudinary
        const response = await fetch(fileUrl);
        
        if (!response.ok) {
            res.status(404);
            throw new Error("File not found");
        }

        // Get the file buffer
        const buffer = await response.arrayBuffer();
        
        // Extract filename from URL or use default
        const urlParts = fileUrl.split('/');
        const filename = urlParts[urlParts.length - 1].split('.')[0];
        const extension = fileUrl.match(/\.(pdf|jpg|jpeg|png|doc|docx)$/i)?.[1] || 'pdf';
        
        // Set appropriate headers
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.${extension}"`);
        res.setHeader('Content-Length', buffer.byteLength);
        
        // Send the file
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Download error:', error);
        res.status(500);
        throw new Error("Failed to download file");
    }
});

export const saveChatHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { messages } = req.body;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    let chatHistory = await ChatHistory.findOne({ patient: patient._id });
    
    if (chatHistory) {
        chatHistory.messages = messages;
        await chatHistory.save();
    } else {
        chatHistory = await ChatHistory.create({
            patient: patient._id,
            messages
        });
    }

    res.status(200).json({
        message: "Chat history saved successfully",
        chatHistory
    });
});

export const getChatHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    const chatHistory = await ChatHistory.findOne({ patient: patient._id });

    res.status(200).json({
        messages: chatHistory ? chatHistory.messages : []
    });
});

export const deleteChatHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
        res.status(404);
        throw new Error("Patient not found");
    }

    await ChatHistory.deleteOne({ patient: patient._id });

    res.status(200).json({
        message: "Chat history deleted successfully"
    });
});