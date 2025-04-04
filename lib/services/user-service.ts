// lib/services/user-service.ts
import { hash } from 'bcrypt';
import { prisma } from '../prisma';
import { Role, User } from '@prisma/client';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: Role;
  company?: string;
  phone?: string;
}

export interface UpdateUserInput {
  name?: string;
  company?: string;
  phone?: string;
  role?: Role;
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  role: Role;
  company?: string | null;
  phone?: string | null;
  createdAt: Date;
}

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(input: CreateUserInput): Promise<UserSummary> {
    const { email, password, name, role = 'CUSTOMER', company, phone } = input;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        company,
        phone,
      },
    });
    
    return this.sanitizeUser(user);
  }
  
  /**
   * Get a user by ID
   */
  static async getUserById(id: string): Promise<UserSummary | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return null;
    }
    
    return this.sanitizeUser(user);
  }
  
  /**
   * Get a user by email
   */
  static async getUserByEmail(email: string): Promise<UserSummary | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return null;
    }
    
    return this.sanitizeUser(user);
  }
  
  /**
   * Update a user
   */
  static async updateUser(id: string, input: UpdateUserInput): Promise<UserSummary> {
    const user = await prisma.user.update({
      where: { id },
      data: input,
    });
    
    return this.sanitizeUser(user);
  }
  
  /**
   * Get all customers (users with CUSTOMER role)
   */
  static async getCustomers(): Promise<UserSummary[]> {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { name: 'asc' },
    });
    
    return customers.map(customer => this.sanitizeUser(customer));
  }
  
  /**
   * Remove sensitive info from user object
   */
  static sanitizeUser(user: User): UserSummary {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}