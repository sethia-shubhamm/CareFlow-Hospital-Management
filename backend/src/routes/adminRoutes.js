import { Router } from "express";
import {
  getStats,
  getRecentActivities,
  getTodayAppointments,
  getTopDoctors,
  getAllDoctors,
  createDoctor,
  updateDoctorStatus,
  deleteDoctor,
  getAllPatients,
  createPatient,
  deletePatient,
  getAllAppointments,
  cancelAppointment,
  generateBill
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// Stats and Overview
router.get("/stats", authMiddleware, getStats);
router.get("/recent-activities", authMiddleware, getRecentActivities);
router.get("/today-appointments", authMiddleware, getTodayAppointments);
router.get("/top-doctors", authMiddleware, getTopDoctors);

// Doctors Management
router.get("/doctors", authMiddleware, getAllDoctors);
router.post("/doctors", authMiddleware, createDoctor);
router.put("/doctors/:id/status", authMiddleware, updateDoctorStatus);
router.delete("/doctors/:id", authMiddleware, deleteDoctor);

// Patients Management
router.get("/patients", authMiddleware, getAllPatients);
router.post("/patients", authMiddleware, createPatient);
router.delete("/patients/:id", authMiddleware, deletePatient);

// Appointments Management
router.get("/appointments", authMiddleware, getAllAppointments);
router.put("/appointments/:id/cancel", authMiddleware, cancelAppointment);
router.post("/bills/generate/:id", authMiddleware, generateBill);

export default router;
