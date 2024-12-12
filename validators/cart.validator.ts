
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateCart = (req: Request, res: Response, next: NextFunction): void => {
    try{
        const itemSchema = Joi.object({
          
            quantity_purchased:  Joi.number().integer().min(0).required(),
                     
        });

    
        const schema = Joi.object({
            items : Joi.array().items(itemSchema).optional(),
            total_amount : Joi.number().positive().optional(),
            created_at: Joi.date().optional(),
            isActive: Joi.boolean().optional(),   
        }).unknown();
    
        const { error } = schema.validate(req.body);
        
        if (error) {
            console.log(error);
            res.status(400).json({ error: error.details[0].message });
        } else {
            next();
        }
    }catch(error){
        console.error('Unexpected error during validation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
   
};

module.exports = { validateCart };