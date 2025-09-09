const productModel = require('../Models/productModel');

const quantiyChanger = async (status, value) => {
    try {
        const product = await productModel.findById(value.productId);

        if (!product) {
            console.error("Product not found");
            return;
        }

        let newQty = product.Quantity;

        if (status === "deduct") {
            newQty = parseInt(product.Quantity) - parseInt(value.qty);
            if (newQty < 0) newQty = 0; // prevent negative quantity
        }

        if (status === "add") {
            newQty = parseInt(product.Quantity) + parseInt(value.qty);
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            product._id,
            { $set: { Quantity: newQty } },
            { new: true }
        );

        return updatedProduct;
    } catch (err) {
        console.error("Error in quantiyChanger:", err.message);
    }
};

module.exports = quantiyChanger;
