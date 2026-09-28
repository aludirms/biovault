import bcrypt from "bcryptjs";
import { dataStore } from "../services/dataStore.js";
import { generateToken } from "../middleware/authMiddleware.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide institutional email and password.",
      });
    }

    const user = await dataStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or unauthorized user account.",
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or unauthorized user account.",
      });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: "Authentication successful.",
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, employeeId, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required registration fields.",
      });
    }

    const existing = await dataStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const roleLabels = {
      admin: "Biobank Administrator",
      technician: "Senior Lab Technician",
      researcher: "Principal Investigator",
      auditor: "Quality Assurance Auditor",
    };

    const newUser = await dataStore.createUser({
      name,
      email: email.toLowerCase(),
      employeeId: employeeId || `BV-EMP-${Math.floor(100 + Math.random() * 900)}`,
      password: hashedPassword,
      role: role || "technician",
      roleLabel: roleLabels[role] || "Lab Staff",
      department: department || "Bio-Repository Core",
      avatar: name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
    });

    const token = generateToken(newUser);
    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: "Staff account successfully registered.",
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const { password, ...safeUser } = req.user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    next(err);
  }
};

export const getAllStaff = async (req, res, next) => {
  try {
    const staff = await dataStore.getAllUsers();
    res.json({ success: true, users: staff });
  } catch (err) {
    next(err);
  }
};
