const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- كود الاتصال الذكي ---
// استبدل كلمة AMICCs8GGadWg1jg بالباسورد الذي وضعته في Atlas
const dbURI = 'mongodb+srv://qasioun1tv_db_user:AMICCs8GGadWg1jg@cluster0.lpyqb59.mongodb.net/qasioun_db?retryWrites=true&w=majority';

mongoose.connect(dbURI)
    .then(async () => {
        console.log("✅ اتصلنا بنجاح.. القاعدة تعمل الآن أونلاين!");
        
        // هنا السيرفر سينشئ حساب المدير (QASUION) تلقائياً أول ما يشتغل
        const User = mongoose.model('User');
        const adminExists = await User.findOne({ username: 'QASUION' });
        if (!adminExists) {
            await new User({
                username: 'QASUION',
                password: 'qasiountv0666',
                displayName: 'Admin',
                isAdmin: true
            }).save();
            console.log("👤 تم إنشاء حساب المدير بنجاح داخل القاعدة الجديدة");
        }
    })
    .catch(err => console.log("❌ مشكلة في القاعدة: ", err.message));

// --- تعريف الموديل ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: String,
    isAdmin: { type: Boolean, default: false }
});
mongoose.model('User', userSchema);

// --- رابط تسجيل الدخول ---
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const User = mongoose.model('User');
        const user = await User.findOne({ username, password });
        if (user) return res.json(user);
        res.status(401).json({ message: "خطأ في اليوزر أو الباسورد" });
    } catch (e) {
        res.status(500).json({ message: "خطأ في السيرفر" });
    }
});

app.get('/', (req, res) => res.send("السيرفر شغال 100%"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = app;
