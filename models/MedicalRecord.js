import mongoose from "mongoose";

const MedicalRecordSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },
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
  },
  { timestamps: true }
);

export default mongoose.models.MedicalRecord || mongoose.model("MedicalRecord", MedicalRecordSchema);
