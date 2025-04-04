// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs'; // Changed from bcrypt to bcryptjs

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');
  
  // Create admin user if it doesn't exist
  const adminEmail = 'admin@example.com';
  
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });
  
  if (!existingAdmin) {
    console.log('Creating admin user...');
    
    const hashedPassword = await hash('admin123', 10);
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    
    console.log('Admin user created successfully.');
  } else {
    console.log('Admin user already exists.');
  }
  
  // Create demo customer user if it doesn't exist
  const customerEmail = 'customer@example.com';
  
  const existingCustomer = await prisma.user.findUnique({
    where: {
      email: customerEmail,
    },
  });
  
  if (!existingCustomer) {
    console.log('Creating demo customer user...');
    
    const hashedPassword = await hash('customer123', 10);
    
    await prisma.user.create({
      data: {
        email: customerEmail,
        name: 'Customer User',
        password: hashedPassword,
        role: Role.CUSTOMER,
        company: 'Demo Company',
      },
    });
    
    console.log('Demo customer user created successfully.');
  } else {
    console.log('Demo customer user already exists.');
  }
  
  // Create demo portfolio projects if none exist
  const existingProjects = await prisma.portfolioProject.count();
  
  if (existingProjects === 0) {
    console.log('Creating demo portfolio projects...');
    
    await prisma.portfolioProject.createMany({
      data: [
        {
          title: 'E-Commerce Platform',
          description: 'A full-featured e-commerce platform with product management, cart functionality, and secure payment processing.',
          category: 'FULLSTACK',
          technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
          features: ['User authentication', 'Product search and filtering', 'Shopping cart', 'Payment integration', 'Order management'],
          demoUrl: 'https://example.com/demo',
          githubUrl: 'https://github.com/username/project',
          order: 1,
        },
        {
          title: 'Real-time Chat Application',
          description: 'A real-time messaging platform with private and group chat capabilities, online status, and notification system.',
          category: 'FULLSTACK',
          technologies: ['React', 'Socket.io', 'Express', 'MongoDB', 'JWT'],
          features: ['Real-time messaging', 'User authentication', 'Online status indicators', 'Read receipts', 'File sharing'],
          demoUrl: 'https://example.com/demo',
          githubUrl: 'https://github.com/username/project',
          order: 2,
        },
        {
          title: 'AI-Powered Content Creator',
          description: 'A platform that leverages AI to help users generate and optimize content for various platforms and purposes.',
          category: 'FUTURE',
          technologies: ['React', 'Next.js', 'OpenAI API', 'Node.js', 'MongoDB'],
          status: 'research',
          timeline: 'Q3 2025',
          order: 1,
        },
        {
          title: 'Photography Portfolio',
          description: 'A minimalist portfolio showcasing my landscape and urban photography work, built with a focus on image quality and performance.',
          category: 'PERSONAL',
          technologies: ['Gatsby', 'Netlify CMS'],
          tags: ['Photography', 'Gatsby', 'Netlify CMS'],
          demoUrl: 'https://example.com',
          order: 1,
        },
      ],
    });
    
    console.log('Demo portfolio projects created successfully.');
  } else {
    console.log('Portfolio projects already exist.');
  }
  
  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });