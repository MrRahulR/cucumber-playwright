const { LoginPage } = require('./LoginPage');
const { ProductPage } = require('./ProductPage');
const { HeaderPage } = require('./HeaderPage');
const { CheckoutPage } = require('./CheckoutPage');
const { OrderDetailsPage } = require('./OrderDetailsPage');
const { OrderHistoryPage } = require('./OrderHistoryPage');

class Index {
  constructor(page) {
    this.loginPage = new LoginPage(page);
    this.productPage = new ProductPage(page);
    this.headerPage = new HeaderPage(page);
    this.checkoutPage = new CheckoutPage(page);
    this.orderDetailsPage = new OrderDetailsPage(page);
    this.orderHistoryPage = new OrderHistoryPage(page);
  }

  getLoginPage() {
    return this.loginPage;
  }

  getProductPage() {
    return this.productPage;
  }

  getHeaderPage() {
    return this.headerPage;
  }

  getCheckoutPage() {
    return this.checkoutPage;
  }

  getOrderDetailsPage() {
    return this.orderDetailsPage;
  }

  getOrderHistoryPage() {
    return this.orderHistoryPage;
  }
}

module.exports = { Index };
