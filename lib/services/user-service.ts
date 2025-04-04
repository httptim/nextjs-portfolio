import { hash } from 'bcryptjs';
import { prisma } from '../prisma';
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  company: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'CUSTOMER']),
});

export class UserService {
  static async createUser(userData: z.infer<typeof UserSchema>) {
    // Validate input data
    const validatedData = UserSchema.parse(userData);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
