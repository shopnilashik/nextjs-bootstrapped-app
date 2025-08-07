const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

const invoiceController = {
  // Get all invoices
  getAllInvoices: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search = '', customerId } = req.query;
      const skip = (page - 1) * limit;

      let where = {};

      if (search) {
        where.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { note: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } }
        ];
      }

      if (customerId) {
        where.customerId = parseInt(customerId);
      }

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          },
          orderBy: { date: 'desc' }
        }),
        prisma.invoice.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          invoices,
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

  // Get invoice by ID
  getInvoiceById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const invoice = await prisma.invoice.findUnique({
        where: { id: parseInt(id) },
        include: {
          customer: true
        }
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        data: { invoice }
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new invoice
  createInvoice: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { date, description, amount, note, customerId } = req.body;

      // Check if customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId) }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const invoice = await prisma.invoice.create({
        data: {
          date: new Date(date),
          description,
          amount: parseFloat(amount),
          note,
          customerId: parseInt(customerId)
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: { invoice }
      });
    } catch (error) {
      next(error);
    }
  },

  // Update invoice
  updateInvoice: async (req, res, next) => {
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
      const { date, description, amount, note, customerId } = req.body;

      const existingInvoice = await prisma.invoice.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingInvoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Check if customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId) }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const invoice = await prisma.invoice.update({
        where: { id: parseInt(id) },
        data: {
          date: new Date(date),
          description,
          amount: parseFloat(amount),
          note,
          customerId: parseInt(customerId)
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Invoice updated successfully',
        data: { invoice }
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete invoice
  deleteInvoice: async (req, res, next) => {
    try {
      const { id } = req.params;

      const existingInvoice = await prisma.invoice.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingInvoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      await prisma.invoice.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Invoice deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Download invoice (simulate PDF generation)
  downloadInvoice: async (req, res, next) => {
    try {
      const { id } = req.params;

      const invoice = await prisma.invoice.findUnique({
        where: { id: parseInt(id) },
        include: {
          customer: true
        }
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Simulate PDF content (in real app, you'd use a PDF library like puppeteer or jsPDF)
      const pdfContent = `
INVOICE #${invoice.id}
Date: ${invoice.date.toDateString()}
Customer: ${invoice.customer.name}
Address: ${invoice.customer.address || 'N/A'}
Phone: ${invoice.customer.phone || 'N/A'}
Email: ${invoice.customer.email || 'N/A'}
Job Location: ${invoice.customer.jobLocation || 'N/A'}

Description: ${invoice.description}
Amount: $${invoice.amount}
Note: ${invoice.note || 'N/A'}

Generated on: ${new Date().toDateString()}
      `;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.id}.pdf`);
      res.send(pdfContent);
    } catch (error) {
      next(error);
    }
  },

  // Get invoice statistics
  getInvoiceStats: async (req, res, next) => {
    try {
      const [totalInvoices, totalAmount, recentInvoices] = await Promise.all([
        prisma.invoice.count(),
        prisma.invoice.aggregate({
          _sum: {
            amount: true
          }
        }),
        prisma.invoice.findMany({
          take: 5,
          orderBy: { date: 'desc' },
          include: {
            customer: {
              select: {
                name: true
              }
            }
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          totalInvoices,
          totalAmount: totalAmount._sum.amount || 0,
          recentInvoices
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = invoiceController;
