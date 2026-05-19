const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  hostel: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to DB');
    const users = await User.find().limit(2);
    if (users.length > 0) {
      const user = users[0];
      console.log('Found user:', user.email);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash('password123', salt);
      await user.save();
      console.log('Updated password for', user.email, 'to password123');
      
      if (users.length > 1) {
        const user2 = users[1];
        user2.password = await bcrypt.hash('password123', salt);
        await user2.save();
        console.log('Updated password for', user2.email, 'to password123');
      }
    } else {
      console.log('No users found');
    }
    mongoose.connection.close();
  })
  .catch(err => console.error(err));
