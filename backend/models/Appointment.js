const mongoose = require('mongoose');

const allowedStatuses = ['pending', 'confirmed', 'cancelled'];

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient reference (patientId) is required']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor reference (doctorId) is required']
  },
  date: {
    type: String,
    required: [true, 'Appointment date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Appointment time slot is required']
  },
  status: {
    type: String,
    enum: {
      values: allowedStatuses,
      message: '{VALUE} is not a valid status. Allowed values: ' + allowedStatuses.join(', ')
    },
    default: 'pending'
  },
  reason: {
    type: String,
    maxlength: [300, 'Reason cannot exceed 300 characters'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
