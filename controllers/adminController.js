const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

exports.addCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const profile = req.file ? req.file.filename : null;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const newCategory = await Category.create({
      name,
      description,
      status: status || 'active',
      profile
    });

    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update fields
    if (name) category.name = name;
    if (description) category.description = description;
    if (status) category.status = status;
    if (req.file) category.profile = req.file.filename;

    await category.save();

    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addSubCategory = async (req, res) => {
  try {
    const { name, categoryId, description, status } = req.body;
    const profile = req.file ? req.file.filename : null;

    if (!name || !categoryId) {
      return res.status(400).json({ message: 'Name and categoryId are required' });
    }

    const newSubCategory = await SubCategory.create({
      name,
      categoryId,
      description,
      status: status || 'Active',
      profile
    });

    res.status(201).json({ message: 'SubCategory created successfully', subCategory: newSubCategory });
  } catch (error) {
    console.error('Error adding subcategory:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name']
      }]
    });
    res.status(200).json(subCategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, description, status } = req.body;
    
    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return res.status(404).json({ message: 'SubCategory not found' });
    }

    // Update fields
    if (name) subCategory.name = name;
    if (categoryId) subCategory.categoryId = categoryId;
    if (description) subCategory.description = description;
    if (status) subCategory.status = status;
    if (req.file) subCategory.profile = req.file.filename;

    await subCategory.save();

    res.status(200).json({ message: 'SubCategory updated successfully', subCategory });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await SubCategory.findByPk(id);
    
    if (!subCategory) {
      return res.status(404).json({ message: 'SubCategory not found' });
    }

    await subCategory.destroy();
    res.status(200).json({ message: 'SubCategory deleted successfully' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};