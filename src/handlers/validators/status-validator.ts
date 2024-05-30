import Joi from 'joi';

enum statustype {
  admin = "ADMIN",
  other = "NORMAL"
}

export const createStatusValidation = Joi.object<CreateStatusValidationRequest>({
  description: Joi.string().valid(...Object.values(statustype)).required(),
  key:Joi.string().optional()
}).options({ abortEarly: false });

export interface CreateStatusValidationRequest {
    description:statustype
    key:string
}