import { Router } from "express";
import { 
    getDoctorDashboard, 
    getDoctorAppointments, 
    cancelAppointment,
    rescheduleAppointment,
    getDoctorPatients, 
    getDoctorProfile, 
    updateDoctorProfile, 
    updateDoctorPassword,
    getDoctorMedicalRecords,
    addMedicalRecord
} from "../controllers/doctor.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// Dashboard
router.get('/dashboard', authMiddleware, getDoctorDashboard);

// Appointments
router.get('/appointments', authMiddleware, getDoctorAppointments);
router.put('/appointments/:appointmentId/cancel', authMiddleware, cancelAppointment);
router.put('/appointments/:appointmentId/reschedule', authMiddleware, rescheduleAppointment);

// Patients
router.get('/patients', authMiddleware, getDoctorPatients);

// Profile
router.get('/profile', authMiddleware, getDoctorProfile);
router.put('/profile', authMiddleware, updateDoctorProfile);
router.put('/update-password', authMiddleware, updateDoctorPassword);

// Medical Records
router.get('/medical-records', authMiddleware, getDoctorMedicalRecords);
router.post('/medical-records', authMiddleware, addMedicalRecord);

export default router;
