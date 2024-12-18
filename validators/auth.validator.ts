import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { UserStatus } from "../utils/enumUtils";

export const validateRegisterUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const schema = Joi.object({
      username: Joi.string()
        .pattern(/^[a-zA-Z0-9.\-_$@*!]+$/)
        .min(3)
        .max(20)
        .required(),
      email: Joi.string().email().required(),
      contact_number: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required(),
      address: Joi.string().min(5).max(50).required(),
      password: Joi.string()
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        )
        .min(8)
        .max(20)
        .required(),
  role_id: Joi.string().hex().length(24).required().optional(),
  role: Joi.string().required(),
  // role_specific_details: Joi.array()
  //   .items(
  //     Joi.object({
  //       name: Joi.string().required(),
  //       type: Joi.string().required(),
  //     })
  //   )
  //   .optional(),

  refreshToken: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(UserStatus))
    .default(UserStatus.Pending),

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
export const validateLoginUser = (req: Request, res: Response, next: NextFunction): void => {
    try{
        const schema = Joi.object({
            email: Joi.string().email().max(50).required(),
            password: Joi.string()
                .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
                .min(8)
                .max(20)
                .required(),
        });
    
        const { error } = schema.validate(req.body);
        if (error) {
            console.log(error);
            res.status(400).json({ error: error.details[0].message });
        }else{
        next();
        }
    }catch(error){
        console.error('Unexpected error during validation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
   
};

module.exports = { validateRegisterUser, validateLoginUser };