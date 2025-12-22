import { Router } from "express";
import { getPatientDashboard, getPatientProfile, getPatientAppointments, getMedicalRecords, getBills, getAllDoctors, bookAppointment, updatePatientProfile, updatePatientPassword, updateEmergencyContact, uploadProfileImage } from "../controllers/patient.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
//import upload from "../middleware/upload.middleware.js";
const router = Router();

router.get('/', authMiddleware, getPatientDashboard)
router.get('/profile', authMiddleware, getPatientProfile);
router.get('/appointments', authMiddleware, getPatientAppointments);
router.get('/medicalRecords', authMiddleware, getMedicalRecords);
router.get('/bills', authMiddleware, getBills);
router.get('/doctors', authMiddleware, getAllDoctors);
router.post('/book-appointment', authMiddleware, bookAppointment);
router.put('/profile', authMiddleware, updatePatientProfile);
router.put('/update-password', authMiddleware, updatePatientPassword);
router.put('/emergency-contact', authMiddleware, updateEmergencyContact);
//router.post('/upload-profile-image', authMiddleware, upload.single('profileImage'), uploadProfileImage);

export default router;