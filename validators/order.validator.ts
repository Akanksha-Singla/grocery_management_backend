
import { Request, Response, NextFunction } from 'express';
import { PaymentMode } from '../utils/enumUtils';
import Joi from 'joi';

export const validateOrder = (req: Request, res: Response, next: NextFunction): void => {
    try{
     const schema = Joi.object({
            address:Joi.string().required(),
            paymentMode:Joi.string().optional(),
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

module.exports = { validateOrder };