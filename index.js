const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. تعريف موديل المستخدم ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: String,
    phone: String,
    countryCode: String,
    isAdmin: { type: Boolean, default: false },
    subscriptionMonths: { type: Number, default: 0 },
    trialHours: { type: Number, default: 0 },
    trialEnd: { type: Number, default: null },
    subscriptionEnd: { type: Number, default: null }
});

const User = mongoose.model('User', userSchema);

// --- 2. إعداد رابط الاتصال ---
// استبدل كلمة AMICCs8GGadWg1jg بكلمة المرور الحقيقية إذا قمت بتغييرها
const dbURI = 'mongodb+srv://qasioun1tv_db_user:AMICCs8GGadWg1jg@cluster0.lpyqb59.mongodb.net/qasioun_db?retryWrites=true&w=majority';

// --- 3. الاتصال بالقاعدة مع إضافة إعدادات التوافق ---
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log("✅ تم الاتصال بقاعدة بيانات MongoDB Atlas بنجاح");
    
    // إنشاء حساب المدير تلقائياً إذا لم يكن موجوداً
    const adminExists = await User.findOne({ username: 'QASUION' });
    if (!adminExists) {
        await new User({
            username: 'QASUION',
            password: 'qasiountv0666',
            displayName: 'Admin',
            isAdmin: true
        }).save();
        console.log("👤 تم إنشاء حساب المدير بنجاح");
    }
})
.catch(err => {
    console.error("❌ خطأ في الاتصال بالقاعدة:", err.message);
});

// --- 4. روابط API ---

app.get('/', (req, res) => res.send('Server is running...'));

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) {
            res.json(user);
        } else {
            res.status(401).json({ message: "خطأ في البيانات" });
        }
    } catch (e) {
        res.status(500).json({ message: "خطأ داخلي" });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (e) {
        res.status(500).json({ message: "خطأ في جلب البيانات" });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (e) {
        res.status(400).json({ message: "فشل إضافة المستخدم" });
    }
});

app.put('/api/users/:username', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ username: req.params.username }, req.body, { new: true });
        res.json(user);
    } catch (e) {
        res.status(400).json({ message: "فشل التحديث" });
    }
});

app.delete('/api/users/:username', async (req, res) => {
    try {
        await User.findOneAndDelete({ username: req.params.username });
        res.json({ message: "تم الحذف" });
    } catch (e) {
        res.status(400).json({ message: "فشل الحذف" });
    }
});

// --- 5. تشغيل السيرفر ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server on port ${PORT}`);
});

module.exports = app; // مهم جداً لعمل Vercel بشكل صحيح
