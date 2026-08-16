const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const MONGODB_URI = "mongodb+srv://ammadashraf7792_db_user:aBkcmLIL1cSaxQjv@cluster0.ovah27l.mongodb.net/hospital_db?retryWrites=true&w=majority";

const AppointmentSchema = new mongoose.Schema({}, { strict: false });
const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);

async function clearAppointments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");

    const result = await Appointment.deleteMany({});
    console.log(`Cleared ${result.deletedCount} appointments from the database! Total count now: 0`);
  } catch (err) {
    console.error("Error clearing appointments:", err);
  } finally {
    await mongoose.disconnect();
  }
}

clearAppointments();
