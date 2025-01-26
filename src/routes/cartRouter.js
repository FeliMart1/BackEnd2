const express = require('express');
const router = express.Router();
const Cart = require('../dao/models/Cart');
const Product = require('../dao/models/Product');
const Ticket = require('../dao/models/Ticket');
const { isUser, isAdmin } = require('../middlewares/authorization');
const mongoose = require('mongoose');

// Agregar producto al carrito
router.post('/:cid/products/:pid', isUser, async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const product = await Product.findById(pid);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Stock insuficiente' });
    }

    const existingProduct = cart.products.find((p) => p.product.toString() === pid);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    await cart.save();
    res.status(200).json({ message: 'Producto agregado al carrito', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error al agregar producto al carrito', error: err.message });
  }
});

// Finalizar compra
router.post('/:cid/purchase', isUser, async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const failedProducts = [];
    let totalAmount = 0;

    for (const item of cart.products) {
      const product = item.product;
      if (product.stock >= item.quantity) {
        product.stock -= item.quantity;
        totalAmount += product.price * item.quantity;
        await product.save();
      } else {
        failedProducts.push(product._id);
      }
    }

    // Generar ticket si hay productos comprados
    if (totalAmount > 0) {
      const ticket = new Ticket({
        code: new mongoose.Types.ObjectId(),
        purchase_datetime: new Date(),
        amount: totalAmount,
        purchaser: req.user.email,
      });
      await ticket.save();
    }

    // Actualizar carrito con los productos fallidos
    cart.products = cart.products.filter((item) =>
      failedProducts.includes(item.product._id)
    );
    await cart.save();

    res.status(200).json({
      message: 'Compra procesada',
      failedProducts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al procesar la compra', error: err.message });
  }
});

// Obtener carrito por ID
router.get('/:cid', isUser, async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el carrito', error: err.message });
  }
});

// Eliminar producto del carrito
router.delete('/:cid/products/:pid', isUser, async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    cart.products = cart.products.filter((item) => item.product.toString() !== pid);
    await cart.save();

    res.status(200).json({ message: 'Producto eliminado del carrito', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto', error: err.message });
  }
});

module.exports = router;
