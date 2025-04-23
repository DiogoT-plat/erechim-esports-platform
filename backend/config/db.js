const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Usando MongoDB Atlas para implantação
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://erechim-esports:erechim-esports-2025@cluster0.mongodb.net/erechim-esports?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
