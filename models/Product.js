/**
 * Represents a product in the catalog.
 */
class Product {
    /**
     * Creates a new Product instance.
     * @param {number} productId - Unique identifier for the product
     * @param {string} productName - Name of the product
     * @param {string} productCategory - Category the product belongs to
     * @param {number} productPrice - Price of the product
     */
    constructor(productId, productName, productCategory, productPrice) {
        this.productId = productId;
        this.productName = productName;
        this.productCategory = productCategory;
        this.productPrice = productPrice;
    }

    /**
     * Returns a plain object representation of the product.
     * @returns {{ productId: number, productName: string, productCategory: string, productPrice: number }}
     */
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
