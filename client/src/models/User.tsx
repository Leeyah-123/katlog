import mongoose from 'mongoose';

type UserType = {
  _id: string;
  walletAddress: string;
  email: string;
};

const UserSchema = new mongoose.Schema<UserType>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User<UserType> ||
  mongoose.model<UserType>('User', UserSchema);
