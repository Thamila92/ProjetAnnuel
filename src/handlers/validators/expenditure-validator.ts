import Joi from "joi"

export const listExpendituresValidation = Joi.object<ListExpendituresRequest>({
    id:Joi.number().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional()
})

export interface ListExpendituresRequest {
    id?:number
    page?: number
    limit?: number
}