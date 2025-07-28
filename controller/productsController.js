const Products = require('../model/products');

//Create Products
const createProduct = async (req, res) => {
    try {
        const {
            product_name,
            discription,
            category,
            unit,
            is_seasonal,      // optional
            season_start,     // optional
            season_end,       // optional
            is_active,
            price,
            cgst,
            sgst,
            delivery_fee
        } = req.body;

        let product_image = null;
        if (req.file) {
            product_image = req.file.path;
        }

        // Fallback defaults
        const seasonalValue = is_seasonal || 'All Season';
        const seasonStartValue = is_seasonal ? season_start || null : null;
        const seasonEndValue = is_seasonal ? season_end || null : null;

        const newProduct = await Products.create({
            product_name,
            discription,
            category,
            unit,
            is_seasonal: seasonalValue,
            season_start: seasonStartValue,
            season_end: seasonEndValue,
            is_active,
            product_image,
            price,
            cgst: cgst !== undefined ? cgst : 0,
            sgst: sgst !== undefined ? sgst : 0,
            delivery_fee: delivery_fee !== undefined ? delivery_fee : 0
        });

        res.status(201).json({
            message: 'Product added successfully',
            data: newProduct
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
const getAllProducts = async (req, res) => {
    try {
        const products = await Products.findAll();
        res.status(200).json({ data: products });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getProductsById = async (req, res) => {
    try{
        const { id } = req.params;
        const products = await Products.findByPk(id);
        if(!products) {
            return res.status(404).json({ message: 'Products Not Found' });
        }
        res.status(200).json({ data: products });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const updateProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            product_name,
            discription,
            category,
            unit,
            is_seasonal,
            season_start,
            season_end,
            is_active,
            price,
            cgst,
            sgst,
            delivery_fee
        } = req.body;

        let product_image = null;

        if (req.file) {
            product_image = req.file.path;
        }

        const product = await Products.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Product Not Found' });
        }

        product.product_name = product_name !== undefined ? product_name : product.product_name;
        product.discription = discription !== undefined ? discription : product.discription;
        product.category = category !== undefined ? category : product.category;
        product.unit = unit !== undefined ? unit : product.unit;
        product.is_seasonal = is_seasonal !== undefined ? is_seasonal : product.is_seasonal;
        product.season_start = season_start !== undefined ? season_start : product.season_start;
        product.season_end = season_end !== undefined ? season_end : product.season_end;
        product.is_active = is_active !== undefined ? is_active : product.is_active;
        product.price = price !==undefined ? price : product.price;
        product.cgst = cgst !==undefined ? cgst : product.cgst;
        product.sgst = sgst !==undefined ? sgst : product.sgst;
        product.delivery_fee = delivery_fee !==undefined ? delivery_fee : product.delivery_fee;
        if (product_image) {
            product.product_image = product_image;
        }

        await product.save();

        res.status(200).json({
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const deleteProducts = async (req, res) => {
    try{
        const { id } = req.params;
        const products = await Products.findByPk(id);
        if(!products) {
            return res.status(200).json({ message: 'Products Not Found' });
        }
        await products.destroy();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductsById,
    updateProducts,
    deleteProducts
};
