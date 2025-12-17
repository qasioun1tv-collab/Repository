const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. تعريف موديل المستخدم (Schema) ---
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

// --- 2. الاتصال بقاعدة البيانات (MongoDB Atlas) ---
// ملاحظة: تأكد من كتابة كلمة المرور بدلاً من <db_password>
// الرابط المعدل بالباسورد الخاص بك
const dbURI = 'mongodb+srv://qasioun1tv_db_user:AMICCs8GGadWg1jg@cluster0.lpyqb59.mongodb.net/qasioun_db?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
    .then(async () => {
        console.log("✅ تم الاتصال بقاعدة بيانات MongoDB Atlas بنجاح");
        
        // التحقق من وجود حساب المدير وإضافته تلقائياً
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

// --- 3. روابط الـ API (Endpoints) ---

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) { 
            res.json(user); 
        } else { 
            res.status(401).json({ message: "خطأ في اليوزر أو الباسورد" }); 
        }
    } catch (e) {
        res.status(500).json({ message: "خطأ في السيرفر" });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (e) { 
        res.status(400).json({ message: "اليوزر موجود بالفعل" }); 
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (e) {
        res.status(500).json({ message: "فشل جلب البيانات" });
    }
});

app.put('/api/users/:username', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { username: req.params.username }, 
            req.body, 
            { new: true }
        );
        res.json(user);
    } catch (e) {
        res.status(400).json({ message: "فشل التحديث" });
    }
});

app.delete('/api/users/:username', async (req, res) => {
    try {
        await User.findOneAndDelete({ username: req.params.username });
        res.json({ message: "تم الحذف بنجاح" });
    } catch (e) {
        res.status(400).json({ message: "فشل الحذف" });
    }
});

// --- 4. تشغيل السيرفر ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل الآن على المنفذ: ${PORT}`);
});
