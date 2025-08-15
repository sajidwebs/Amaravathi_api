const Vendor = require('../models/Vendor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Create Vendor with password hashing
exports.addVendor = async (req, res) => {
  try {
    let {
      first_name,
      email_id,
      mobile_number,
      business_name,
      categories,
      address,
      latitude,
      longitude,
      password,
    } = req.body;

    // Required field check
    if (!first_name || !email_id || !mobile_number || !categories || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, Email, Phone, Category, and Password are required',
      });
    }

    // Trim & normalize inputs
    const name = first_name.trim();
    const email = email_id.trim().toLowerCase();
    const phone = mobile_number.trim();
    const category = categories.trim();
    business_name = business_name ? business_name.trim() : "";
    address = address ? address.trim() : "";

    // Check duplicates
    const existingVendorByEmail = await Vendor.findOne({ where: { email } });
    if (existingVendorByEmail) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    const existingVendorByPhone = await Vendor.findOne({ where: { phone } });
    if (existingVendorByPhone) {
      return res.status(400).json({ success: false, message: 'Phone number already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle profile image filename if uploaded
    const profileImage = req.file ? req.file.filename : null;

    // Create new vendor instance
    const newVendor = await Vendor.create({
      name,
      email,
      phone,
      category,
      business_name,
      address,
      latitude,
      longitude,
      status: 'Active',
      profileImage,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully',
      data: {
        id: newVendor.id,
        name: newVendor.name,
        email: newVendor.email,
        phone: newVendor.phone,
        business_name: newVendor.business_name,
        category: newVendor.category,
        address: newVendor.address,
        latitude: newVendor.latitude,
        longitude: newVendor.longitude,
        profileImage: newVendor.profileImage,
      }
    });
  } catch (error) {
    console.error('Error adding vendor:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Login Vendor - validate password and generate JWT
exports.loginVendor = async (req, res) => {
  try {
    const { email_id, password } = req.body;

    if (!email_id || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const vendor = await Vendor.findOne({ where: { email: email_id.toLowerCase().trim() } });
    if (!vendor) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, vendor.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: vendor.id, email: vendor.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        business_name: vendor.business_name,
        category: vendor.category,
        address: vendor.address,
        latitude: vendor.latitude,
        longitude: vendor.longitude,
        profileImage: vendor.profileImage,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get current logged-in vendor profile (use with auth middleware)
exports.getCurrentVendor = async (req, res) => {
  try {
    if (!req.vendor || !req.vendor.id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    
    const vendor = await Vendor.findByPk(req.vendor.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    console.error('Error fetching current vendor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all vendors
exports.getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: error.message,
    });
  }
};

// Update Vendor (with optional password update)
exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      first_name,
      email_id,
      mobile_number,
      business_name,
      categories,
      address,
      latitude,
      longitude,
      status,
      password,
    } = req.body;

    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Check for email duplicates (excluding current vendor)
    if (email_id) {
      const email = email_id.trim().toLowerCase();
      const existingVendor = await Vendor.findOne({ 
        where: { 
          email: email,
          id: { [Op.ne]: id }
        } 
      });
      
      if (existingVendor) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      vendor.email = email;
    }

    // Check for phone duplicates (excluding current vendor)
    if (mobile_number) {
      const phone = mobile_number.trim();
      const existingVendor = await Vendor.findOne({ 
        where: { 
          phone: phone,
          id: { [Op.ne]: id }
        } 
      });
      
      if (existingVendor) {
        return res.status(400).json({ success: false, message: 'Phone number already exists' });
      }
      vendor.phone = phone;
    }

    // Update other fields
    if (first_name) vendor.name = first_name.trim();
    if (business_name !== undefined) vendor.business_name = business_name.trim();
    if (categories) vendor.category = categories.trim();
    if (address) vendor.address = address;
    if (latitude) vendor.latitude = latitude;
    if (longitude) vendor.longitude = longitude;
    if (status) vendor.status = status;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      vendor.password = await bcrypt.hash(password, salt);
    }

    if (req.file) vendor.profileImage = req.file.filename;

    await vendor.save();

    // Return updated vendor without password
    const vendorData = vendor.toJSON();
    delete vendorData.password;

    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendorData,
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor',
      error: error.message,
    });
  }
};

// Delete Vendor
exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findByPk(id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    await vendor.destroy();

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vendor',
      error: error.message,
    });
  }
};