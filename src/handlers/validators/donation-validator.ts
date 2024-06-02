import Joi from 'joi';

export const createDonationValidation = Joi.object<CreateDonationValidationRequest>({
  amount: Joi.number().min(5).required(),
  description:Joi.string().min(5).required()
}).options({ abortEarly: false });

export interface CreateDonationValidationRequest {
    amount:number
    description:string
}