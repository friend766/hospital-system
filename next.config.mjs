import dns from "dns";

// Configure public DNS resolution for MongoDB Atlas SRV lookups on Windows
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignored if environment restricts custom DNS
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

export default nextConfig;
