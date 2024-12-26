import mongoose from 'mongoose';

type UserType = {
  _id: string;
  email: string;
  password: string;
};

const UserSchema = new mongoose.Schema<UserType>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User<UserType> ||
  mongoose.model<UserType>('User', UserSchema);
