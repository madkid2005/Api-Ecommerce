// project-6-ecommerce/server.js
const fastify = require('fastify')({ 
  logger: true,
  // غیرفعال کردن strict mode برای سازگاری کامل با کلمات کلیدی Swagger مانند example
  ajv: {
    customOptions: {
      strict: false
    }
  }
});

const cors = require('@fastify/cors');
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');

const PORT = process.env.PORT || 3006;

// ============ ۱. تعریف روت‌ها در قالب یک پلاگین مجزا ============
async function ecommerceRoutes(fastify, options) {
  
  // ROUTE 1: Home
  fastify.get('/', {
    schema: {
      tags: ['General'],
      summary: 'اطلاعات سرویس',
      description: 'مشاهده وضعیت و اندپوینت‌های سرویس فروشگاهی'
    },
    handler: async () => {
      return {
        service: 'Ecommerce API',
        version: '1.0.0',
        docs: `http://localhost:${PORT}/docs`,
        status: '🟢 Online',
        message: 'Free access - No API Key required'
      };
    }
  });

  // ROUTE 2: Get All Products
  fastify.get('/products', {
    schema: {
      tags: ['Products'],
      summary: 'دریافت لیست محصولات',
      description: 'دریافت لیستی از تمام محصولات موجود در فروشگاه همراه با قیمت و موجودی',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'number' },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  title: { type: 'string' },
                  price: { type: 'number' },
                  category: { type: 'string' },
                  in_stock: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    },
    handler: async () => {
      return {
        success: true,
        count: 2,
        products: [
          { id: 1, title: 'گوشی موبایل هوشمند', price: 450, category: 'electronics', in_stock: true },
          { id: 2, title: 'کفش ورزشی', price: 85, category: 'clothing', in_stock: false }
        ]
      };
    }
  });

  // ROUTE 3: Get Product Details
  fastify.get('/products/:id', {
    schema: {
      tags: ['Products'],
      summary: 'جزئیات یک محصول',
      description: 'دریافت اطلاعات کامل یک محصول بر اساس شناسه (ID)',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number', description: 'شناسه محصول', example: 1 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            product: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                price: { type: 'number' },
                description: { type: 'string' },
                category: { type: 'string' }
              }
            }
          }
        }
      }
    },
    handler: async (request) => {
      const { id } = request.params;
      return {
        success: true,
        product: {
          id: Number(id),
          title: 'گوشی موبایل هوشمند',
          price: 450,
          description: 'یک گوشی هوشمند با کیفیت بالا و صفحه نمایش آمولد.',
          category: 'electronics'
        }
      };
    }
  });
}

// ============ ۲. بخش اصلی تنظیمات و اجرای سرور ============
const start = async () => {
  try {
    // ثبت پلاگین CORS
    await fastify.register(cors, { origin: '*' });

    // ثبت پلاگین مستندات Swagger
    await fastify.register(swagger, {
      openapi: {
        openapi: '3.0.3',
        info: {
          title: 'Ecommerce API',
          description: 'Ecommerce Service',
          version: '1.0.0',
          contact: {
            name: 'API Frooshi',
            email: 'support@apifrooshi.com'
          }
        }
      }
    });

    // ثبت Swagger UI با آدرس‌دهی مستقیم و صریح (جلوگیری از خطای No Operations)
    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        url: `http://localhost:${PORT}/docs/json`,
        docExpansion: 'list',
        deepLinking: true,
        tryItOutEnabled: true
      },
      staticCSP: true
    });

    // ثبت روت‌ها در قالب پلاگین مستقل
    await fastify.register(ecommerceRoutes);

    // آماده سازی و روشن کردن سرور
    await fastify.ready();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    
    console.log(`\n🚀 Ecommerce API running on http://localhost:${PORT}`);
    console.log(`📚 Swagger Docs: http://localhost:${PORT}/docs`);
    console.log(`🔓 Free access - No API Key required\n`);

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();