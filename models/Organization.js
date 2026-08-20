const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide an organization / hospital name"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: "",
    },
    plan: {
      type: String,
      enum: ["free_trial", "starter", "pro", "enterprise"],
      default: "free_trial",
    },
    stripeCustomerId: {
      type: String,
      default: "",
    },
    stripeSubscriptionId: {
      type: String,
      default: "",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "trialing", "past_due", "canceled"],
      default: "active",
    },
    maxDoctors: {
      type: Number,
      default: 5,
    },
    maxPatients: {
      type: Number,
      default: 100,
    },
    maxMedicines: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Organization ||
  mongoose.model("Organization", OrganizationSchema);
