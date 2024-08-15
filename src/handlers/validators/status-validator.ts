import Joi from 'joi';
import { statustype } from "../../database/entities/status";

export const createStatusValidation = Joi.object({
    type: Joi.string().valid(...Object.values(statustype)).required(),
    key: Joi.string().optional()
}).options({ abortEarly: false });

export const updateStatusValidation = Joi.object({
    type: Joi.string().valid(...Object.values(statustype)).optional(),
    key: Joi.string().optional()
}).options({ abortEarly: false });

export const statusIdValidation = Joi.object({
    id: Joi.number().integer().required()
}).options({ abortEarly: false });
export interface CreateStatusValidationRequest {
  type: statustype;   
  key?: string;        
}