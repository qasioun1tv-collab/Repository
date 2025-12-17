const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. الاتصال بقاعدة البيانات
mongoose.connect('mongodb://127.0.0.1:27017/qasioun_db')
    .then(async () => {
        console.log("✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح");
        
        // 2. التحقق من وجود حساب المدير وإضافته إذا لم يكن موجوداً
        const adminExists = await User.findOne({ username: 'QASUION' });
        if (!adminExists) {
            const admin = new User({
                username: 'QASUION',
                password: 'qasiountv0666',
                displayName: 'Admin',
                phone: '+963945245117',
                countryCode: '+963',
                isAdmin: true,
                subscriptionMonths: 0,
                trialHours: 0,
                trialEnd: null,
                subscriptionEnd: null
            });
            await admin.save();
            console.log("👤 تم إنشاء حساب المدير (QASUION) بنجاح");
        }
    })
    .catch(err => console.log("❌ خطأ في الاتصال بالقاعدة:", err));

// 3. تعريف موديل المستخدم
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: String,
    phone: String,
    countryCode: String,
    isAdmin: { type: Boolean, default: false },
    subscriptionMonths: Number,
    trialHours: Number,
    trialEnd: Number,
    subscriptionEnd: Number
});

const User = mongoose.model('User', userSchema);

// 4. روابط الـ API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) { res.json(user); } 
    else { res.status(401).json({ message: "خطأ في اليوزر أو الباسورد" }); }
});

app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (e) { res.status(400).json({ message: "موجود مسبقاً" }); }
});

app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.put('/api/users/:username', async (req, res) => {
    const user = await User.findOneAndUpdate({ username: req.params.username }, req.body, { new: true });
    res.json(user);
});

app.delete('/api/users/:username', async (req, res) => {
    await User.findOneAndDelete({ username: req.params.username });
    res.json({ message: "تم الحذف" });
});

app.listen(3000, () => {
    console.log(`🚀 السيرفر يعمل على: http://localhost:3000`);
});