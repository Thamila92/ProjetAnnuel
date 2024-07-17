import Joi from "joi";

export const skillValidation = Joi.object({
    name: Joi.string().required()
});
