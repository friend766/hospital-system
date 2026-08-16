import mongoose from "mongoose";

const MedicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    visitDate: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    diagnosis: {
      type: String,
      default: "",
    },
    treatment: {
      type: String,
      default: "",
    },
    // TODO (teammate): attach Prescription reference/ID or "Create Prescription" button payload here
  },
  { timestamps: true }
);

export default mongoose.models.MedicalRecord || mongoose.model("MedicalRecord", MedicalRecordSchema);
