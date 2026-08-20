const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';

// Import Mongoose Models (Task 5)
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

// ==========================================
// In-Memory Fallback Data Store & Auth Users
// ==========================================
let isDbConnected = false;

// Pre-configured system users with roles
const users = [
  {
    id: 'user_admin',
    name: 'Hospital Administrator',
    email: 'admin@medcare.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: 'user_doc_1',
    name: 'Dr. Sarah Patel',
    email: 'sarah.patel@medcare.com',
    password: 'doctor123',
    role: 'doctor',
    specialisation: 'Cardiology'
  },
  {
    id: 'user_doc_2',
    name: 'Dr. Arjun Mehta',
    email: 'arjun.mehta@medcare.com',
    password: 'doctor123',
    role: 'doctor',
    specialisation: 'Neurology'
  },
  {
    id: 'user_patient_1',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@medcare.com',
    password: 'patient123',
    role: 'patient',
    bloodGroup: 'B+',
    phone: '+91 9876543210',
    age: 28
  },
  {
    id: 'user_patient_2',
    name: 'Sneha Joshi',
    email: 'sneha.joshi@medcare.com',
    password: 'patient123',
    role: 'patient',
    bloodGroup: 'O+',
    phone: '+91 9876543211',
    age: 34
  }
];

let inMemoryDoctors = [
  {
    _id: 'doc_1',
    id: 'doc_1',
    name: 'Dr. Sarah Patel',
    email: 'sarah.patel@medcare.com',
    specialisation: 'Cardiology',
    available: true
  },
  {
    _id: 'doc_2',
    id: 'doc_2',
    name: 'Dr. Arjun Mehta',
    email: 'arjun.mehta@medcare.com',
    specialisation: 'Neurology',
    available: true
  },
  {
    _id: 'doc_3',
    id: 'doc_3',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@medcare.com',
    specialisation: 'Pediatrics',
    available: false
  },
  {
    _id: 'doc_4',
    id: 'doc_4',
    name: 'Dr. Rajesh Verma',
    email: 'rajesh.verma@medcare.com',
    specialisation: 'Orthopedics',
    available: true
  },
  {
    _id: 'doc_5',
    id: 'doc_5',
    name: 'Dr. Ananya Iyer',
    email: 'ananya.iyer@medcare.com',
    specialisation: 'Dermatology',
    available: true
  }
];

let inMemoryPatients = [
  {
    _id: 'pat_1',
    id: 'pat_1',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@medcare.com',
    phone: '+91 9876543210',
    bloodGroup: 'B+',
    age: 28
  },
  {
    _id: 'pat_2',
    id: 'pat_2',
    name: 'Sneha Joshi',
    email: 'sneha.joshi@medcare.com',
    phone: '+91 9876543211',
    bloodGroup: 'O+',
    age: 34
  },
  {
    _id: 'pat_3',
    id: 'pat_3',
    name: 'Amit Kumar',
    email: 'amit.kumar@medcare.com',
    phone: '+91 9876543212',
    bloodGroup: 'A+',
    age: 45
  }
];

let inMemoryAppointments = [
  {
    _id: 'apt_1',
    id: 'apt_1',
    patientName: 'Rohan Sharma',
    doctorName: 'Dr. Sarah Patel',
    date: '2026-08-25',
    timeSlot: '10:00 AM - 10:30 AM',
    status: 'confirmed',
    reason: 'Routine cardiac health checkup'
  },
  {
    _id: 'apt_2',
    id: 'apt_2',
    patientName: 'Sneha Joshi',
    doctorName: 'Dr. Arjun Mehta',
    date: '2026-08-26',
    timeSlot: '02:00 PM - 02:30 PM',
    status: 'pending',
    reason: 'Migraine and neurological consultation'
  },
  {
    _id: 'apt_3',
    id: 'apt_3',
    patientName: 'Amit Kumar',
    doctorName: 'Dr. Rajesh Verma',
    date: '2026-08-22',
    timeSlot: '11:30 AM - 12:00 PM',
    status: 'cancelled',
    reason: 'Knee ligament follow-up'
  }
];

// ==========================================
// Middleware Configuration
// ==========================================
app.use(cors());
app.use(express.json());

// Global Request Logger Middleware (Task 3)
app.use(requestLogger);

// ==========================================
// Authentication Endpoints
// ==========================================

/**
 * POST /api/v1/auth/login
 * Role-based login (Patient, Doctor, Admin)
 */
app.post('/api/v1/auth/login', (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.statusCode = 400;
    return next(err);
  }

  // Find user by email
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    return next(err);
  }

  if (role && user.role !== role) {
    const err = new Error(`User is not registered with role: ${role}`);
    err.statusCode = 403;
    return next(err);
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.status(200).json({
    success: true,
    message: `Logged in successfully as ${user.role}`,
    user: userWithoutPassword
  });
});

/**
 * POST /api/v1/auth/register
 * Register new patient account
 */
app.post('/api/v1/auth/register', async (req, res, next) => {
  const { name, email, password, phone, bloodGroup, age } = req.body;

  if (!name || !email || !password) {
    const err = new Error('Name, email, and password are required');
    err.statusCode = 400;
    return next(err);
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 400;
    return next(err);
  }

  const newUser = {
    id: 'user_' + Date.now(),
    name,
    email,
    password,
    role: 'patient',
    phone: phone || '',
    bloodGroup: bloodGroup || 'O+',
    age: Number(age) || 25
  };

  users.push(newUser);
  inMemoryPatients.push({
    _id: 'pat_' + Date.now(),
    id: 'pat_' + Date.now(),
    name,
    email,
    phone: phone || '',
    bloodGroup: bloodGroup || 'O+',
    age: Number(age) || 25
  });

  const { password: _, ...userWithoutPassword } = newUser;
  return res.status(201).json({
    success: true,
    message: 'Patient registered successfully',
    user: userWithoutPassword
  });
});

// ==========================================
// REST API Endpoints (Task 3 & 4)
// ==========================================

/**
 * Health check & DB connection status endpoint
 */
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    backend: 'running',
    port: PORT,
    database: isDbConnected ? 'connected' : 'in-memory',
    databaseType: isDbConnected ? 'MongoDB (Mongoose Database)' : 'In-Memory Mock Store (Active Fallback)',
    mongoUri: MONGO_URI,
    activeDoctors: inMemoryDoctors.length,
    activeAppointments: inMemoryAppointments.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/doctors
 * Purpose: Return all doctors (HTTP 200) (Task 3 & 4)
 */
app.get('/api/v1/doctors', async (req, res, next) => {
  try {
    if (isDbConnected) {
      const doctors = await Doctor.find().sort({ createdAt: -1 });
      return res.status(200).json(doctors);
    }
    return res.status(200).json(inMemoryDoctors);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/doctors (Admin Add Doctor)
 */
app.post('/api/v1/doctors', async (req, res, next) => {
  try {
    const { name, email, specialisation, available = true } = req.body;

    if (!name || !specialisation) {
      const err = new Error('Doctor name and specialisation are required');
      err.statusCode = 400;
      return next(err);
    }

    if (isDbConnected) {
      const doc = new Doctor({ name, email, specialisation, available });
      const savedDoc = await doc.save();
      return res.status(201).json({
        success: true,
        message: 'Doctor added successfully',
        data: savedDoc
      });
    }

    const newDoc = {
      _id: 'doc_' + Date.now(),
      id: 'doc_' + Date.now(),
      name,
      email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@medcare.com`,
      specialisation,
      available: Boolean(available)
    };

    inMemoryDoctors.unshift(newDoc);
    return res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      data: newDoc
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/doctors/:id/availability (Doctor / Admin Toggle Availability)
 */
app.patch('/api/v1/doctors/:id/availability', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    if (isDbConnected && mongoose.Types.ObjectId.isValid(id)) {
      const doc = await Doctor.findByIdAndUpdate(id, { available }, { new: true });
      if (!doc) {
        const err = new Error('Doctor not found');
        err.statusCode = 404;
        return next(err);
      }
      return res.status(200).json({ success: true, data: doc });
    }

    const docIndex = inMemoryDoctors.findIndex((d) => d._id === id || d.id === id || d.name === id);
    if (docIndex === -1) {
      const err = new Error('Doctor not found');
      err.statusCode = 404;
      return next(err);
    }

    inMemoryDoctors[docIndex].available = available !== undefined ? available : !inMemoryDoctors[docIndex].available;
    return res.status(200).json({ success: true, data: inMemoryDoctors[docIndex] });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/doctors/:id (Admin Remove Doctor)
 */
app.delete('/api/v1/doctors/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected && mongoose.Types.ObjectId.isValid(id)) {
      await Doctor.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Doctor deleted' });
    }

    inMemoryDoctors = inMemoryDoctors.filter((d) => d._id !== id && d.id !== id);
    return res.status(200).json({ success: true, message: 'Doctor deleted' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/appointments
 * Purpose: Return all appointments (HTTP 200) (Task 3)
 */
app.get('/api/v1/appointments', async (req, res, next) => {
  try {
    if (isDbConnected) {
      const appointments = await Appointment.find()
        .populate('patientId', 'name email phone bloodGroup age')
        .populate('doctorId', 'name specialisation email available')
        .sort({ createdAt: -1 });

      const formatted = appointments.map((apt) => ({
        _id: apt._id,
        id: apt._id.toString(),
        patientName: apt.patientId ? apt.patientId.name : 'Unknown Patient',
        doctorName: apt.doctorId ? apt.doctorId.name : 'Unknown Doctor',
        date: apt.date,
        timeSlot: apt.timeSlot,
        status: apt.status,
        reason: apt.reason || ''
      }));
      return res.status(200).json(formatted);
    }

    return res.status(200).json(inMemoryAppointments);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/appointments
 * Purpose: Create a new appointment (HTTP 201) (Task 3)
 */
app.post('/api/v1/appointments', async (req, res, next) => {
  try {
    const { patientName, doctorName, date, timeSlot, status = 'pending', reason = '', patientId, doctorId } = req.body;

    if (!patientName && !patientId) {
      const err = new Error('Patient name or patientId is required');
      err.statusCode = 400;
      return next(err);
    }

    if (!doctorName && !doctorId) {
      const err = new Error('Doctor name or doctorId is required');
      err.statusCode = 400;
      return next(err);
    }

    if (!date) {
      const err = new Error('Appointment date is required');
      err.statusCode = 400;
      return next(err);
    }

    // Ensure future booking only (today or future)
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      const err = new Error(`Invalid appointment date '${date}'. Appointments must be booked for today or a future date.`);
      err.statusCode = 400;
      return next(err);
    }

    if (!timeSlot) {
      const err = new Error('Appointment time slot is required');
      err.statusCode = 400;
      return next(err);
    }

    if (reason && reason.length > 300) {
      const err = new Error('Reason cannot exceed 300 characters');
      err.statusCode = 400;
      return next(err);
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      const err = new Error(`Invalid status '${status}'. Allowed: pending, confirmed, cancelled`);
      err.statusCode = 400;
      return next(err);
    }

    if (isDbConnected) {
      let resolvedPatientId = patientId;
      let resolvedDoctorId = doctorId;

      if (!resolvedPatientId && patientName) {
        let patientDoc = await Patient.findOne({ name: patientName });
        if (!patientDoc) {
          patientDoc = await Patient.create({
            name: patientName,
            email: `${patientName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}@medcare.com`,
            bloodGroup: 'B+',
            age: 30
          });
        }
        resolvedPatientId = patientDoc._id;
      }

      if (!resolvedDoctorId && doctorName) {
        let cleanDocName = doctorName.replace(/^Dr\.\s*/i, '').trim();
        let doctorDoc = await Doctor.findOne({ name: { $regex: cleanDocName, $options: 'i' } });
        if (!doctorDoc) {
          doctorDoc = await Doctor.create({
            name: doctorName,
            specialisation: 'General Medicine',
            available: true
          });
        }
        resolvedDoctorId = doctorDoc._id;
      }

      if (resolvedPatientId && resolvedDoctorId) {
        const newAppointment = new Appointment({
          patientId: resolvedPatientId,
          doctorId: resolvedDoctorId,
          date,
          timeSlot,
          status,
          reason
        });

        const saved = await newAppointment.save();
        const populated = await Appointment.findById(saved._id)
          .populate('patientId')
          .populate('doctorId');

        return res.status(201).json({
          success: true,
          message: 'Appointment created successfully in MongoDB',
          data: {
            _id: populated._id,
            id: populated._id.toString(),
            patientName: populated.patientId ? populated.patientId.name : patientName,
            doctorName: populated.doctorId ? populated.doctorId.name : doctorName,
            date: populated.date,
            timeSlot: populated.timeSlot,
            status: populated.status,
            reason: populated.reason
          }
        });
      }
    }

    // In-memory creation
    const newAppointment = {
      _id: 'apt_' + Date.now(),
      id: 'apt_' + Date.now(),
      patientName: patientName || 'Patient',
      doctorName: doctorName || 'Doctor',
      date,
      timeSlot,
      status: status || 'pending',
      reason: reason || ''
    };

    inMemoryAppointments.unshift(newAppointment);

    return res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: newAppointment
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/appointments/:id (Cancel / Delete Appointment)
 */
app.delete('/api/v1/appointments/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected && mongoose.Types.ObjectId.isValid(id)) {
      await Appointment.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
    }

    inMemoryAppointments = inMemoryAppointments.filter((a) => a._id !== id && a.id !== id);
    return res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/appointments/:id/status (Doctor / Admin Update Status)
 */
app.patch('/api/v1/appointments/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      const err = new Error(`Invalid status '${status}'. Allowed: pending, confirmed, cancelled`);
      err.statusCode = 400;
      return next(err);
    }

    if (isDbConnected && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Appointment.findByIdAndUpdate(id, { status }, { new: true })
        .populate('patientId')
        .populate('doctorId');
      if (!updated) {
        const err = new Error('Appointment not found');
        err.statusCode = 404;
        return next(err);
      }
      return res.status(200).json({
        success: true,
        message: `Appointment status updated to ${status}`,
        data: updated
      });
    }

    const aptIndex = inMemoryAppointments.findIndex((a) => a._id === id || a.id === id);
    if (aptIndex === -1) {
      const err = new Error('Appointment not found');
      err.statusCode = 404;
      return next(err);
    }

    inMemoryAppointments[aptIndex].status = status;
    return res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: inMemoryAppointments[aptIndex]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/patients (Admin Patient Directory)
 */
app.get('/api/v1/patients', async (req, res, next) => {
  try {
    if (isDbConnected) {
      const patients = await Patient.find().sort({ createdAt: -1 });
      return res.status(200).json(patients);
    }
    return res.status(200).json(inMemoryPatients);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/stats (Admin Dashboard Overview)
 */
app.get('/api/v1/admin/stats', async (req, res, next) => {
  try {
    const totalDoctors = inMemoryDoctors.length;
    const availableDoctors = inMemoryDoctors.filter((d) => d.available !== false).length;
    const totalPatients = inMemoryPatients.length;
    const totalAppointments = inMemoryAppointments.length;
    const confirmedAppointments = inMemoryAppointments.filter((a) => a.status === 'confirmed').length;
    const pendingAppointments = inMemoryAppointments.filter((a) => a.status === 'pending').length;
    const cancelledAppointments = inMemoryAppointments.filter((a) => a.status === 'cancelled').length;

    return res.status(200).json({
      totalDoctors,
      availableDoctors,
      totalPatients,
      totalAppointments,
      confirmedAppointments,
      pendingAppointments,
      cancelledAppointments
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// Task 5: Schema Testing & Demonstration Endpoints
// ==========================================

app.post('/api/v1/demo/validate-patient', async (req, res, next) => {
  try {
    const patient = new Patient(req.body);
    const validationError = patient.validateSync();
    if (validationError) {
      return next(validationError);
    }
    if (isDbConnected) await patient.save();

    return res.status(201).json({
      success: true,
      message: 'Patient schema validation passed!',
      data: patient
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/demo/run-validation-tests', (req, res) => {
  const results = {
    testSuite: 'Task 5 Mongoose Validation Tests',
    timestamp: new Date().toISOString(),
    tests: []
  };

  const validPatient = new Patient({
    name: 'Rahul Sen',
    email: 'rahul.sen@example.com',
    phone: '9876543210',
    bloodGroup: 'O+',
    age: 29
  });
  const err1 = validPatient.validateSync();
  results.tests.push({
    testName: '1. Valid Patient Creation',
    passed: !err1,
    status: err1 ? 'FAILED' : 'SUCCESS'
  });

  const invalidPatient1 = new Patient({
    email: 'noname@example.com',
    bloodGroup: 'A+'
  });
  const err2 = invalidPatient1.validateSync();
  results.tests.push({
    testName: '2. Patient Validation Failure (Missing Required Name)',
    expectedFailure: true,
    errorMessages: err2 ? Object.values(err2.errors).map((e) => e.message) : null,
    passed: !!err2,
    status: err2 ? 'VALIDATION CAUGHT AS EXPECTED (SUCCESS)' : 'FAILED'
  });

  res.status(200).json(results);
});

// ==========================================
// Global Error Handler Middleware (Task 3)
// ==========================================
app.use(errorHandler);

// ==========================================
// Database Connection & Server Initialization
// ==========================================
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    isDbConnected = true;
    console.log(`[MongoDB] Connected successfully to ${MONGO_URI}`);
  } catch (err) {
    console.warn(`[MongoDB] Running backend in memory-mode with mock persistence.`);
    isDbConnected = false;
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`MedCare Plus Backend Server running on port ${PORT}`);
    console.log(`Auth & Admin Features Enabled!`);
    console.log(`====================================================`);
  });
};

startServer();

module.exports = app;
