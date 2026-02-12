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

// 1. Allow Vite (Port 5173) to talk to Node (Port 5000)
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json());

const razorpay = new Razorpay({
    key_id: 'rzp_test_S5P0ZwzNXUT7yn', 
    key_secret: 'tOB6CAesiMiFu408nMGnHswe'
});

const userDatabase = new Map();

// 2. The ML Data API
app.get('/api/chamber-data', (req, res) => {
    try {
        const data = fs.readFileSync('./chamber-data.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: "Could not read chamber data" });
    }
});

// 3. Payment APIs
app.post('/api/create-order', async (req, res) => {
    const order = await razorpay.orders.create({
        amount: 100, currency: "INR", receipt: "order_" + Date.now()
    });
    res.json(order);
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

app.listen(5000, () => console.log(`🚀 API Server running on http://localhost:5000`));