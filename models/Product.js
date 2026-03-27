class Product {
    constructor(productId, productName, productCategory, productPrice) {
        this.productId = productId;
        this.productName = productName;
        this.productCategory = productCategory;
        this.productPrice = productPrice;
    }

    toJSON() {
        return {
            productId: this.productId,
            productName: this.productName,
            productCategory: this.productCategory,
            productPrice: this.productPrice,
        };
    }
}

module.exports = Product;
