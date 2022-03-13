import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Db Connected.");
  } catch (error) {
    throw new Error(error);
  }
};

export default dbConnection;
