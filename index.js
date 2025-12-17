const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. تعريف الموديل أولاً (هام جداً)
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
}));

// 2. رابط الاتصال (تأكد من كتابة الباسورد بدقة)
const dbURI = 'mongodb+srv://qasioun1tv_db_user:AMICCs8GGadWg1jg@cluster0.lpyqb59.mongodb.net/qasioun_db?retryWrites=true&w=majority';

// 3. محاولة الاتصال
mongoose.connect(dbURI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.log("❌ DB Error: ", err.message));

// 4. رابط تسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) return res.json(user);
        res.status(401).json({ message: "Invalid credentials" });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// إعدادات Vercel
app.get('/', (req, res) => res.send("Server is Live!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));

module.exports = app;
