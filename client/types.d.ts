import { Connection, Mongoose } from 'mongoose';

declare global {
  let mongoose: { conn: Connection; promise: Promise<Mongoose> } | undefined;
}
