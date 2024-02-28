class ProductPage {
  constructor(page) {
    this.page = page;
    this.productCard = page.locator('div.card-body');
  }

  async waitUntilProductCardDisplay() {
    await this.productCard.first().waitFor({ state: 'visible' });
  }

  async getProductCount() {
    return await this.productCard.count();
  }

  async selectProductByName(productName) {
    for (let i = 0; i < (await this.getProductCount()); i++) {
      if (
        (await this.productCard.nth(i).locator('h5 b').textContent()) ===
        productName
      ) {
        await this.productCard.nth(i).locator('button:nth-of-type(2)').click();
        break;
      }
    }
  }
}

module.exports = { ProductPage };
