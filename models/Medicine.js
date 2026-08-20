import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },
    genericName: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Unit price is required"],
      min: 0,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    dosageForm: {
      type: String,
      default: "Tablet",
      trim: true,
    },
    expiryDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema);
