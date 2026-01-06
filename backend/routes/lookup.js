const express = require('express');
const router = express.Router();
const { lookupService } = require('../services/lookup');

router.post('/', async (req, res) => {
  try {
    const { input, locale } = req.body;

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Input is required and must be a non-empty string',
      });
    }

    if (input.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Input must be 500 characters or less',
      });
    }

    const result = await lookupService.lookup(input.trim(), locale);
    res.json(result);
  } catch (error) {
    console.error('Lookup error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred during lookup',
    });
  }
});

module.exports = { lookupRouter: router };
