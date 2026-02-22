class PaymentProvider {
  async createOrder(booking) {
    throw new Error("Not implemented");
  }

  async verifyPayment(data) {
    throw new Error("Not implemented");
  }
}

module.exports = PaymentProvider;