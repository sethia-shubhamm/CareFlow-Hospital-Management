import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import Patient from "../models/patient.model.js";

export const signupUser = asyncHandler (async (req, res) => {
    const { name, email, password, phoneNumber, age, gender, address, bloodType } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phoneNumber || !gender || !address || !bloodType) {
        return res.status(400).json({ message: "All required fields must be provided (name, email, password, phoneNumber, gender, address, bloodType)" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        role: 'patient',
    });

    try {
        const newPatient = await Patient.create({
            user: newUser._id,
            name,
            email,
            contactNumber: phoneNumber,
            age,
            gender,
            address,
            bloodType,
        });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 3600000 // 1 hour
        });

        res.status(201).json({ message: "User created successfully", user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            phoneNumber: newUser.phoneNumber,
        } });
    } catch (patientError) {
        // Delete the user if patient creation fails
        await User.deleteOne({ _id: newUser._id });
        return res.status(400).json({ message: patientError.message || "Patient creation failed" });
    }
});

export const loginUser = asyncHandler (async (req, res) => {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }   
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    if (role && user.role !== role) {
  return res.status(403).json({
    message: `You are not authorized as ${role}`
  });
}


    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 3600000 // 1 hour
    });

    res.status(200).json({ message: "Login successful", user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
    } });
});

export const logoutUser = asyncHandler (async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
});