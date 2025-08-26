import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database paths
const DB_PATH = join(__dirname, 'data');
const USERS_FILE = join(DB_PATH, 'users.json');
const STORES_FILE = join(DB_PATH, 'stores.json');
const PRODUCTS_FILE = join(DB_PATH, 'products.json');

// Initialize database
async function initDatabase() {
  try {
    await fs.mkdir(DB_PATH, { recursive: true });
    
    // Initialize users with default admin
    const defaultUsers = [
      {
        id: uuidv4(),
        email: 'admin@admin.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'System Administrator',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        email: 'owner@store.com',
        password: await bcrypt.hash('owner123', 10),
        name: 'Store Owner Demo',
        role: 'store_owner',
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        email: 'user@user.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Normal User Demo',
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ];

    const defaultStores = [
      {
        id: uuidv4(),
        name: 'Tech Paradise',
        description: 'Your one-stop shop for all tech needs',
        ownerId: defaultUsers[1].id,
        category: 'Electronics',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    const defaultProducts = [
      {
        id: uuidv4(),
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        stock: 50,
        category: 'Electronics',
        storeId: defaultStores[0].id,
        image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with health monitoring',
        price: 299.99,
        stock: 30,
        category: 'Electronics',
        storeId: defaultStores[0].id,
        image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
        createdAt: new Date().toISOString()
      }
    ];

    // Write initial data
    await writeData(USERS_FILE, defaultUsers);
    await writeData(STORES_FILE, defaultStores);
    await writeData(PRODUCTS_FILE, defaultProducts);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Database helpers
async function readData(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeData(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await readData(USERS_FILE);
    const user = users.find(u => u.email === email);

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const users = await readData(USERS_FILE);
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeData(USERS_FILE, users);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User routes
app.get('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await readData(USERS_FILE);
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const users = await readData(USERS_FILE);
    const updatedUsers = users.filter(u => u.id !== id);
    
    if (users.length === updatedUsers.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    await writeData(USERS_FILE, updatedUsers);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Store routes
app.get('/api/stores', authenticateToken, async (req, res) => {
  try {
    const stores = await readData(STORES_FILE);
    
    if (req.user.role === 'store_owner') {
      const userStores = stores.filter(s => s.ownerId === req.user.id);
      return res.json(userStores);
    }
    
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/stores', authenticateToken, requireRole(['admin', 'store_owner']), async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const stores = await readData(STORES_FILE);
    const newStore = {
      id: uuidv4(),
      name,
      description,
      category,
      ownerId: req.user.role === 'store_owner' ? req.user.id : req.body.ownerId,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    stores.push(newStore);
    await writeData(STORES_FILE, stores);
    res.status(201).json(newStore);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/stores/:id', authenticateToken, requireRole(['admin', 'store_owner']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, status } = req.body;
    
    const stores = await readData(STORES_FILE);
    const storeIndex = stores.findIndex(s => s.id === id);
    
    if (storeIndex === -1) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Store owners can only edit their own stores
    if (req.user.role === 'store_owner' && stores[storeIndex].ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    stores[storeIndex] = {
      ...stores[storeIndex],
      name: name || stores[storeIndex].name,
      description: description || stores[storeIndex].description,
      category: category || stores[storeIndex].category,
      status: status || stores[storeIndex].status,
      updatedAt: new Date().toISOString()
    };

    await writeData(STORES_FILE, stores);
    res.json(stores[storeIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/stores/:id', authenticateToken, requireRole(['admin', 'store_owner']), async (req, res) => {
  try {
    const { id } = req.params;
    const stores = await readData(STORES_FILE);
    const storeIndex = stores.findIndex(s => s.id === id);
    
    if (storeIndex === -1) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Store owners can only delete their own stores
    if (req.user.role === 'store_owner' && stores[storeIndex].ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    stores.splice(storeIndex, 1);
    await writeData(STORES_FILE, stores);
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Product routes
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await readData(PRODUCTS_FILE);
    const stores = await readData(STORES_FILE);
    
    if (req.user.role === 'store_owner') {
      const userStoreIds = stores.filter(s => s.ownerId === req.user.id).map(s => s.id);
      const userProducts = products.filter(p => userStoreIds.includes(p.storeId));
      return res.json(userProducts);
    }
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/products', authenticateToken, requireRole(['admin', 'store_owner']), async (req, res) => {
  try {
    const { name, description, price, stock, category, storeId, image } = req.body;

    if (!name || !description || !price || !stock || !category || !storeId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify store ownership for store owners
    if (req.user.role === 'store_owner') {
      const stores = await readData(STORES_FILE);
      const store = stores.find(s => s.id === storeId);
      if (!store || store.ownerId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const products = await readData(PRODUCTS_FILE);
    const newProduct = {
      id: uuidv4(),
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      storeId,
      image: image || 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeData(PRODUCTS_FILE, products);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/products/:id', authenticateToken, requireRole(['admin', 'store_owner']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, image } = req.body;
    
    const products = await readData(PRODUCTS_FILE);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Verify store ownership for store owners
    if (req.user.role === 'store_owner') {
      const stores = await readData(STORES_FILE);
      const store = stores.find(s => s.id === products[productIndex].storeId);
      if (!store || store.ownerId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    products[productIndex] = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      description: description || products[productIndex].description,
      price: price !== undefined ? parseFloat(price) : products[productIndex].price,
      stock: stock !== undefined ? parseInt(stock) : products[productIndex].stock,
      category: category || products[productIndex].category,
      image: image || products[productIndex].image,
      updatedAt: new Date().toISOString()
    };

    await writeData(PRODUCTS_FILE, products);
    res.json(products[productIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/products/:id', authenticateToken, requireRole(['admin', 'store_owner']), async (req, res) => {
  try {
    const { id } = req.params;
    const products = await readData(PRODUCTS_FILE);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Verify store ownership for store owners
    if (req.user.role === 'store_owner') {
      const stores = await readData(STORES_FILE);
      const store = stores.find(s => s.id === products[productIndex].storeId);
      if (!store || store.ownerId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    products.splice(productIndex, 1);
    await writeData(PRODUCTS_FILE, products);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard analytics
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const users = await readData(USERS_FILE);
    const stores = await readData(STORES_FILE);
    const products = await readData(PRODUCTS_FILE);

    let stats = {};

    if (req.user.role === 'admin') {
      stats = {
        totalUsers: users.length,
        totalStores: stores.length,
        totalProducts: products.length,
        activeStores: stores.filter(s => s.status === 'active').length
      };
    } else if (req.user.role === 'store_owner') {
      const userStores = stores.filter(s => s.ownerId === req.user.id);
      const userStoreIds = userStores.map(s => s.id);
      const userProducts = products.filter(p => userStoreIds.includes(p.storeId));
      
      stats = {
        totalStores: userStores.length,
        totalProducts: userProducts.length,
        totalStock: userProducts.reduce((sum, p) => sum + p.stock, 0),
        totalValue: userProducts.reduce((sum, p) => sum + (p.price * p.stock), 0)
      };
    } else {
      stats = {
        availableStores: stores.filter(s => s.status === 'active').length,
        availableProducts: products.length
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Login credentials:`);
    console.log(`Admin: admin@admin.com / admin123`);
    console.log(`Store Owner: owner@store.com / owner123`);
    console.log(`User: user@user.com / user123`);
  });
});