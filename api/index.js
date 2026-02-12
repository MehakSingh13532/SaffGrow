import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Allow Vite (Port 5173) to talk to Node (Port 5000), and Vercel deployments
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://saffron-dashboard.vercel.app' // Add your deployed URL here if known, or allow all for now
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow all origins for now to simplify Vercel deployment debugging
    // In production, you might want to restrict this
    return callback(null, true);
  }
}));

app.use(express.json());

const razorpay = new Razorpay({
    key_id: 'rzp_test_S5P0ZwzNXUT7yn', 
    key_secret: 'tOB6CAesiMiFu408nMGnHswe'
});

const userDatabase = new Map();

// Helper to find data file in Vercel environment
const getDataFilePath = () => {
    // In Vercel, files in the root are often in process.cwd()
    const potentialPaths = [
        path.join(process.cwd(), 'chamber-data.json'),
        path.join(__dirname, '..', 'chamber-data.json'),
        path.join(__dirname, 'chamber-data.json')
    ];
    
    for (const p of potentialPaths) {
        if (fs.existsSync(p)) return p;
    }
    return 'chamber-data.json'; // Default fallback
};

// 2. The ML Data API
app.get('/api/chamber-data', (req, res) => {
    try {
        const dataPath = getDataFilePath();
        const data = fs.readFileSync(dataPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error("Error reading data:", err);
        // Fallback data if file read fails
        res.json({
            environmental_data: { temperature: { current: 0 }, humidity: { current: 0 }, soil_moisture: { current: 0 }, co2_level: { current: 0 } },
            plant_growth_data: { estimated_yield: "N/A" },
            system_logs: ["System initialized"],
            alerts_notifications: []
        });
    }
});

// 3. Payment APIs
app.post('/api/create-order', async (req, res) => {
    try {
        const order = await razorpay.orders.create({
            amount: 100, currency: "INR", receipt: "order_" + Date.now()
        });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;
    const expectedSignature = crypto.createHmac('sha256', 'tOB6CAesiMiFu408nMGnHswe')
        .update(razorpay_order_id + "|" + razorpay_payment_id).digest('hex');

    if (expectedSignature === razorpay_signature) {
        userDatabase.set(email.toLowerCase(), { status: 'paid' });
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

app.get('/api/check-status', (req, res) => {
    const user = userDatabase.get(req.query.email?.toLowerCase());
    res.json({ status: user ? user.status : 'unpaid' });
});

// Export the app for Vercel
export default app;
