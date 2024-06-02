import Joi from "joi";

export const createAdminValidation = Joi.object<CreateAdminValidationRequest>({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    key:Joi.string().min(8).required(),
}).options({ abortEarly: false });

export interface CreateAdminValidationRequest {
    name: string
    email: string
    password: string
    key:string
}




export const createOtherValidation = Joi.object<CreateOtherValidationRequest>({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
}).options({ abortEarly: false });

export interface CreateOtherValidationRequest {
    name: string
    email: string
    password: string
}

export const loginOtherValidation = Joi.object<LoginOtherValidationRequest>({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
}).options({ abortEarly: false });

export interface LoginOtherValidationRequest {
    email: string
    password: string
}
// export const createBenefactorValidation = Joi.object<CreateOtherValidationRequest>({
//     name: Joi.string().email().required(),
//     email: Joi.string().email().required(),
//     password: Joi.string().min(8).required()
// }).options({ abortEarly: false });

// export interface CreateOtherValidationRequest {
//     name: string
//     email: string
//     password: string
// }



export const listUsersValidation = Joi.object<ListUsersRequest>({
    type:Joi.string().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional()
})

export interface ListUsersRequest {
    type?:string
    page?: number
    limit?: number
}


export const userIdValidation = Joi.object<UserIdRequest>({
    id: Joi.number().required(),
})

export interface UserIdRequest {
    id: number
}




export const updateUserValidation = Joi.object<UpdateUserRequest>({
    id: Joi.number().required(),
    status:Joi.string().optional(),
    name:Joi.string().optional(),
    email:Joi.string().optional(),
    password:Joi.string().optional(),
    actual_password:Joi.string().required()
})

export interface UpdateUserRequest {
    id: number
    name:string
    email:string
    status:string
    password:string
    actual_password:string
}