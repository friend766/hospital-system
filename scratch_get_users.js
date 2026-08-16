const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const MONGODB_URI = "mongodb+srv://ammadashraf7792_db_user:aBkcmLIL1cSaxQjv@cluster0.ovah27l.mongodb.net/hospital_db?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  phone: String,
  createdAt: Date,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function getUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    const users = await User.find({}, "name email role phone createdAt").sort({ createdAt: -1 }).lean();
    console.log("REGISTERED_USERS_JSON_START");
    console.log(JSON.stringify(users, null, 2));
    console.log("REGISTERED_USERS_JSON_END");
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

getUsers();
