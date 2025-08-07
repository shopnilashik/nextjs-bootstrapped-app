const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

const customerController = {
  // Get all customers
  getAllCustomers: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const skip = (page - 1) * limit;

      const where = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          include: {
            invoices: {
              select: {
                id: true,
                amount: true,
                date: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.customer.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          customers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get customer by ID
  getCustomerById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(id) },
        include: {
          invoices: {
            orderBy: { date: 'desc' }
          }
        }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.json({
        success: true,
        data: { customer }
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new customer
  createCustomer: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { name, address, phone, email, jobLocation } = req.body;

      const customer = await prisma.customer.create({
        data: {
          name,
          address,
          phone,
          email,
          jobLocation
        }
      });

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: { customer }
      });
    } catch (error) {
      next(error);
    }
  },

  // Update customer
  updateCustomer: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { name, address, phone, email, jobLocation } = req.body;

      const existingCustomer = await prisma.customer.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const customer = await prisma.customer.update({
        where: { id: parseInt(id) },
        data: {
          name,
          address,
          phone,
          email,
          jobLocation
        }
      });

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: { customer }
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete customer
  deleteCustomer: async (req, res, next) => {
    try {
      const { id } = req.params;

      const existingCustomer = await prisma.customer.findUnique({
        where: { id: parseInt(id) },
        include: { invoices: true }
      });

      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      if (existingCustomer.invoices.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete customer with existing invoices'
        });
      }

      await prisma.customer.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Customer deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = customerController;
