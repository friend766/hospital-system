import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    availability: {
      days: {
        type: [String],
        default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      },
      timeSlots: {
        type: [String],
        default: ["09:00 AM - 01:00 PM", "02:00 PM - 05:00 PM"],
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
