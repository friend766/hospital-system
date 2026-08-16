import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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
        type: [String], // e.g. ["Monday", "Wednesday", "Friday"]
        default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      },
      timeSlots: {
        type: [String], // e.g. ["09:00 AM - 01:00 PM", "02:00 PM - 05:00 PM"]
        default: ["09:00 AM - 01:00 PM", "02:00 PM - 05:00 PM"],
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
