const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const MONGODB_URI = "mongodb+srv://ammadashraf7792_db_user:aBkcmLIL1cSaxQjv@cluster0.ovah27l.mongodb.net/hospital_db?retryWrites=true&w=majority";

const OrganizationSchema = new mongoose.Schema({
  name: String,
  slug: String,
  plan: String,
  subscriptionStatus: String,
  maxDoctors: Number,
  maxPatients: Number,
  maxMedicines: Number,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  organizationId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const Organization = mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedSaaS() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas...");

    // 1. Create or get Default Hospital Organization
    let defaultOrg = await Organization.findOne({ slug: "central-hospital" });
    if (!defaultOrg) {
      defaultOrg = await Organization.create({
        name: "Central City Hospital",
        slug: "central-hospital",
        plan: "pro",
        subscriptionStatus: "active",
        maxDoctors: 20,
        maxPatients: 1000,
        maxMedicines: 500,
      });
      console.log("Created Default Organization: Central City Hospital ID:", defaultOrg._id);
    } else {
      console.log("Found Existing Default Organization ID:", defaultOrg._id);
    }

    // 2. Link all unlinked users to defaultOrg
    const userUpdateRes = await User.updateMany(
      { role: { $ne: "superadmin" }, organizationId: { $exists: false } },
      { organizationId: defaultOrg._id }
    );
    console.log(`Updated ${userUpdateRes.modifiedCount} existing users with Organization ID.`);

    // 3. Create Super-Admin Account
    const hashedPassword = await bcrypt.hash("password123", 10);
    const superAdmin = await User.findOneAndUpdate(
      { email: "superadmin@saas.com" },
      {
        name: "SaaS Platform SuperAdmin",
        email: "superadmin@saas.com",
        password: hashedPassword,
        role: "superadmin",
        organizationId: null,
      },
      { upsert: true, new: true }
    );
    console.log("SaaS Super-Admin Account Ready: superadmin@saas.com / password123");

    // 4. Update all other collections with organizationId
    const collections = ["patients", "doctors", "appointments", "medicalrecords", "prescriptions", "medicines", "billings"];
    for (const collName of collections) {
      const coll = mongoose.connection.collection(collName);
      const res = await coll.updateMany(
        { organizationId: { $exists: false } },
        { $set: { organizationId: defaultOrg._id } }
      );
      console.log(`Updated collection '${collName}': ${res.modifiedCount} documents linked to Organization.`);
    }

    console.log("\n✅ SaaS Migration & Multi-Tenant Seeding Complete!");
  } catch (err) {
    console.error("Error seeding SaaS:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedSaaS();
