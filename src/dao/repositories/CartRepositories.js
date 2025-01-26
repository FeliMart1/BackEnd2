class CartRepository {
    constructor(dao) {
      this.dao = dao;
    }
  
    async getCartById(cid) {
      return await this.dao.findById(cid).populate('products.product');
    }
  
    async updateCart(cart) {
      return await cart.save();
    }
  }
  
  module.exports = CartRepository;
  