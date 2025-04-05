// prisma/seed.ts
import { PrismaClient, Role, Status, Priority, TaskStatus, InvoiceStatus } from '@prisma/client';
import { hash } from 'bcryptjs'; // Changed from bcrypt to bcryptjs
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Add this to the main function in prisma/seed.ts
  // Create demo testimonials if none exist
  const existingTestimonials = await prisma.testimonial.count();
  
  if (existingTestimonials === 0) {
    console.log('Creating demo testimonials...');
    
    // Get the customer IDs (users with CUSTOMER role)
    const customers = await prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
      },
      select: {
        id: true,
      },
    });
    
    if (customers.length > 0) {
      await prisma.testimonial.createMany({
        data: [
          {
            content: "Working with this developer was a fantastic experience! They delivered high-quality code on time and were very responsive to our feedback. I would highly recommend them for any web development project.",
            rating: 5,
            clientId: customers[0].id,
            position: "Project Manager",
            company: "Tech Solutions Inc.",
            isActive: true,
            order: 1,
          },
          {
            content: "The website they developed for our business exceeded our expectations. Not only does it look amazing, but it's also fast, responsive, and user-friendly. We've received many compliments from our customers.",
            rating: 5,
            clientId: customers[0].id,
            position: "CEO",
            company: "Digital Marketing Pro",
            isActive: true,
            order: 2,
          },
          {
            content: "I appreciated the developer's attention to detail and their ability to translate our requirements into a functional and beautiful website. They were patient with our changes and always delivered high-quality work.",
            rating: 4,
            clientId: customers[0].id,
            position: "Marketing Director",
            company: "Global Designs",
            isActive: true,
            order: 3,
          },
        ],
      });
      
      console.log('Demo testimonials created successfully.');
    } else {
      console.log('No customers found for creating testimonials.');
    }
  } else {
    console.log('Testimonials already exist.');
  }
  
  // Create admin user
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedAdminPassword,
      role: Role.ADMIN,
      company: 'Admin Company'
    },
  });

  console.log('Admin user created:', admin);

  // Create demo customer
  const customerEmail = 'customer@example.com';
  const customerPassword = 'customer123';
  const hashedCustomerPassword = await bcrypt.hash(customerPassword, 10);
  
  const customer = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {},
    create: {
      email: customerEmail,
      name: 'Demo Customer',
      password: hashedCustomerPassword,
      role: Role.CUSTOMER,
      company: 'Demo Company'
    },
  });

  console.log('Customer user created:', customer);

  // Create demo project
  const projectName = 'Demo Website Project';
  const existingProject = await prisma.project.findFirst({
    where: { name: projectName }
  });

  const project = existingProject || await prisma.project.create({
    data: {
      name: projectName,
      description: 'A sample project to demonstrate the dashboard functionality',
      status: Status.ACTIVE,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      clientId: customer.id,
    },
  });

  console.log('Project created:', project);

  // Create demo tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design Homepage',
        description: 'Create the homepage design mockup',
        priority: Priority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        projectId: project.id,
        createdById: admin.id,
        assignedToId: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement Authentication',
        description: 'Set up user authentication system',
        priority: Priority.MEDIUM,
        status: TaskStatus.TODO,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        projectId: project.id,
        createdById: admin.id,
        assignedToId: admin.id,
      },
    }),
  ]);

  console.log('Tasks created:', tasks);

  // Create demo invoice
  const invoice = await prisma.invoice.create({
    data: {
      number: 'INV-001',
      amount: 1000.00,
      status: InvoiceStatus.UNPAID,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      projectId: project.id,
      clientId: customer.id,
      items: {
        create: [
          {
            description: 'Website Development',
            quantity: 1,
            rate: 1000.00,
          },
        ],
      },
    },
  });

  console.log('Invoice created:', invoice);

  // Create demo conversation
  const conversation = await prisma.conversation.create({
    data: {
      projectId: project.id,
      messages: {
        create: [
          {
            content: 'Hello, I have a question about the project timeline.',
            senderId: customer.id,
          },
          {
            content: 'Hi! I\'d be happy to discuss the timeline with you.',
            senderId: admin.id,
          },
        ],
      },
    },
  });

  console.log('Conversation created:', conversation);

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