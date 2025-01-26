const Ticket = require('../dao/models/Ticket');
const Cart = require('../dao/models/Cart');
const Product = require('../dao/models/Product');

const purchaseCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) return res.status(404).send({ message: 'Carrito no encontrado' });

    const unprocessedProducts = [];
    let totalAmount = 0;

    for (const item of cart.products) {
      const product = item.product;
      if (product.stock >= item.quantity) {
        product.stock -= item.quantity;
        totalAmount += product.price * item.quantity;
        await product.save();
      } else {
        unprocessedProducts.push(product._id);
      }
    }

    // Generar ticket si hay productos comprados
    if (totalAmount > 0) {
      const ticket = await Ticket.create({
        code: Math.random().toString(36).substring(2, 10),
        amount: totalAmount,
        purchaser: req.user.email,
      });

      // Filtrar productos no comprados y actualizar el carrito
      cart.products = cart.products.filter((item) =>
        unprocessedProducts.includes(item.product._id)
      );
      await cart.save();

      res.status(200).send({ message: 'Compra realizada', ticket });
    } else {
      res.status(400).send({ message: 'No se pudo procesar la compra', unprocessedProducts });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error al procesar la compra', error });
  }
};

module.exports = { purchaseCart };
