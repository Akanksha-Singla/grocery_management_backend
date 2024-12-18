
import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

export const validateCategory = (req: Request, res: Response, next: NextFunction): void => {
    try{
     const schema = Joi.object({
            name:Joi.string().required(),
            description:Joi.string().required(),
            created_at: Joi.date().optional(),
               
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

module.exports = { validateCategory };