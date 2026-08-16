import mongoose from "mongoose";

const PrescriptionItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  medicineName: { type: String, required: true },
  dosage: { type: String, default: "1 tablet" },
  frequency: { type: String, default: "Twice daily" },
  duration: { type: String, default: "5 days" },
  quantity: { type: Number, required: true, default: 1 },
});

const PrescriptionSchema = new mongoose.Schema(
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
    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord",
      default: null,
    },
    medicines: [PrescriptionItemSchema],
    status: {
      type: String,
      enum: ["pending", "dispensed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
    dispensedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Prescription || mongoose.model("Prescription", PrescriptionSchema);
