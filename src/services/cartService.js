const Cart = require('../dao/models/Cart');
const Product = require('../dao/models/Product');

const addProductToCart = async (cid, pid, quantity) => {
  const cart = await Cart.findById(cid);
  const product = await Product.findById(pid);
  if (!cart || !product) throw new Error('Carrito o producto no encontrado');

  // Lógica de agregar producto
  const existingProduct = cart.products.find((p) => p.product.toString() === pid);
  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    cart.products.push({ product: pid, quantity });
  }
  await cart.save();
  return cart;
};

module.exports = { addProductToCart };
