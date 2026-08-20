const mongoose = require('mongoose');

const allowedBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Patient email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    trim: true
  },
  bloodGroup: {
    type: String,
    enum: {
      values: allowedBloodGroups,
      message: '{VALUE} is not an allowed blood group. Allowed values: ' + allowedBloodGroups.join(', ')
    }
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
