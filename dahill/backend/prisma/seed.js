const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create dummy users
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@dahill.com',
      password: hashedPassword,
    },
  });

  // Create dummy customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'John Smith',
        address: '123 Main St, New York, NY 10001',
        phone: '+1-555-0123',
        email: 'john.smith@email.com',
        jobLocation: 'Manhattan Office Building',
      },
    }),
    prisma.customer.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Sarah Johnson',
        address: '456 Oak Ave, Los Angeles, CA 90210',
        phone: '+1-555-0456',
        email: 'sarah.johnson@email.com',
        jobLocation: 'Downtown LA Warehouse',
      },
    }),
    prisma.customer.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Michael Brown',
        address: '789 Pine Rd, Chicago, IL 60601',
        phone: '+1-555-0789',
        email: 'michael.brown@email.com',
        jobLocation: 'Chicago Industrial Park',
      },
    }),
  ]);

  // Create dummy invoices
  const invoices = [];
  
  // First, check if invoices already exist
  const existingInvoices = await prisma.invoice.findMany();
  
  if (existingInvoices.length === 0) {
    const invoiceData = [
      {
        date: new Date('2024-01-15'),
        description: 'Website Development Services',
        amount: 2500.00,
        note: 'Initial payment for website development project',
        customerId: customers[0].id,
      },
      {
        date: new Date('2024-01-20'),
        description: 'Mobile App Design',
        amount: 1800.00,
        note: 'UI/UX design for mobile application',
        customerId: customers[1].id,
      },
      {
        date: new Date('2024-01-25'),
        description: 'Database Optimization',
        amount: 1200.00,
        note: 'Performance optimization and database restructuring',
        customerId: customers[2].id,
      },
      {
        date: new Date('2024-02-01'),
        description: 'System Maintenance',
        amount: 800.00,
        note: 'Monthly system maintenance and updates',
        customerId: customers[0].id,
      },
    ];

    for (const invoice of invoiceData) {
      const createdInvoice = await prisma.invoice.create({
        data: invoice
      });
      invoices.push(createdInvoice);
    }
  }

  console.log('Seed data created successfully!');
  console.log('Users:', { user });
  console.log('Customers:', customers.length);
  console.log('Invoices:', invoices.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
