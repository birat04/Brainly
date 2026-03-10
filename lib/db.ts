import { getMongoClient } from './mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';
const SALT_ROUNDS = 10;

export async function ensureIndexes() {
  try {
    const client = await getMongoClient();
    const db = client.db();
    await db.collection('users').createIndex(
      { email: 1 },
      {
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } },
      }
    );
    await db.collection('contents').createIndex({ createdAt: -1 });
  } catch (e: any) {
    if (e.code === 11000) return;
    console.error('Failed to create indexes', e);
  }
}

export async function createUser(email: string, password: string, username?: string) {
  const client = await getMongoClient();
  const db = client.db();
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const now = new Date().toISOString();
  const result = await db.collection('users').insertOne({ email, password: hashed, username, createdAt: now });
  const user: User = { id: result.insertedId.toString(), email, username, createdAt: now };
  const token = generateToken(user);
  return { user, token };
}

export async function authenticateUser(email: string, password: string) {
  const client = await getMongoClient();
  const db = client.db();
  const user = await db.collection('users').findOne({ email });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
  const safeUser: User = { id: user._id.toString(), email: user.email, username: user.username, createdAt: user.createdAt };
  const token = generateToken(safeUser);
  return { user: safeUser, token };
}

function generateToken(user: User) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { sub: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}
