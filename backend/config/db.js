import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      'mongodb+srv:MrYarsuf:PeanutButterJellyT1me@cluster0.cu0zdv1.mongodb.net/Food-Del'
    )
    .then(() =>console.log("DB Connected"));
};
