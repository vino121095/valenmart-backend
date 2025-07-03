const Category = require('../model/category');

// Create Category
// Create Category
const createCategory = async (req, res) => {
  try {
    const { category_name, category_description } = req.body;

    // Get uploaded image filename (if exists)
    let category_image = null;
    if (req.file) {
      category_image = `uploads/category_image/${req.file.filename}`;
    }

    const newCategory = await Category.create({
      category_name,
      category_description,
      category_image
    });

    res.status(201).json({
      message: 'Category Created Successfully',
      data: newCategory
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error Creating Category',
      error: error.message
    });
  }
};


// Get All Categories
const getCategory = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get Category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ data: category });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, category_description } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    let category_image = category.category_image;
    if (req.file) {
      category_image = `uploads/category_image/${req.file.filename}`;
    }

    await category.update({
      category_name,
      category_description,
      category_image
    });

    res.status(200).json({
      message: "Category Updated Successfully",
      data: category
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};


// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();
    res.status(200).json({ message: 'Category deleted successfully', data: category });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

module.exports = {
    createCategory,
    getCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
}