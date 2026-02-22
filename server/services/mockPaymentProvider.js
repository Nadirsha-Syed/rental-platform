const PaymentProvider = require("./paymentProvider");

class MockPaymentProvider extends PaymentProvider {
  async createOrder(booking) {
    return {
      orderId: "MOCK_" + booking._id,
      amount: booking.totalPrice,
    };
  }

  async verifyPayment() {
    return { success: true };
  }
}

module.exports = new MockPaymentProvider();