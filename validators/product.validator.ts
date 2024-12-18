import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateCreateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const schema = Joi.object({
      name: Joi.string().required().messages({
        "string.empty": "Product name is required.",
        "any.required": "Product name is mandatory."
      }),
      description: Joi.string().allow("").optional(),
    //   category: Joi.alternatives()
    //     .try(
    //       Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId pattern
    //       Joi.string() // Allow enums or plain strings
    //     )
    //     .required()
    //     .messages({
    //       "any.required": "Category is required.",
    //       "string.pattern.base": "Invalid ObjectId for category."
    //     }),
      price: Joi.number().positive().precision(2).required().messages({
        "number.base": "Price must be a number.",
        "number.positive": "Price must be a positive value.",
        "any.required": "Price is mandatory."
      }),
      quantity: Joi.number().integer().min(0).required().messages({
        "number.base": "Quantity must be a number.",
        "number.integer": "Quantity must be an integer.",
        "number.min": "Quantity cannot be negative.",
        "any.required": "Quantity is mandatory."
      }),
      // imageUrl: Joi.string().optional().messages({
      //   "string.uri": "Image URL must be a valid URI."
      // }),
      availability: Joi.boolean().default(true),
      sellerId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
        "string.pattern.base": "Invalid ObjectId for sellerId."
      }),
      rating: Joi.number().min(0).max(5).default(0).messages({
        "number.min": "Rating cannot be less than 0.",
        "number.max": "Rating cannot exceed 5."
      }),
      totalReviews: Joi.number().integer().min(0).default(0).messages({
        "number.integer": "Total reviews must be an integer.",
        "number.min": "Total reviews cannot be negative."
      }),
      createdAt: Joi.date().optional().messages({
        "date.base": "CreatedAt must be a valid date."
      })
    }).unknown();

    const { error } = schema.validate(req.body);
    if (error) {
      console.log(error);
      res.status(400).json({ error: error.details[0].message });
    } else {
      next();
    }
  } catch (error) {
    console.error("Unexpected error during validation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const validateUpdateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const schema = Joi.object({
      name: Joi.string().optional(),
      description: Joi.string().allow("").optional(),
    //   category: Joi.alternatives()
    //     .try(
    //       Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId pattern
    //       Joi.string() // Allow enums or plain strings
    //     )
    //     .optional(),
      price: Joi.number().positive().precision(2).optional(),
      quantity: Joi.number().integer().min(0).optional(),
      // imageUrl: Joi.string().uri().optional(),
      availability: Joi.boolean().optional(),
      sellerId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
      rating: Joi.number().min(0).max(5).optional(),
      totalReviews: Joi.number().integer().min(0).optional(),
      createdAt: Joi.date().optional()
    }).unknown();

    const { error } = schema.validate(req.body);
    if (error) {
      console.log(error);
      res.status(400).json({ error: error.details[0].message });
    } else {
      next();
    }
  } catch (error) {
    console.error("Unexpected error during validation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { validateCreateProduct, validateUpdateProduct };
