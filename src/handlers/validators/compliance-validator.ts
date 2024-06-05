import Joi from "joi";

export const complianceValidation = Joi.object<ComplianceRequest>({
    description: Joi.string().required(),
    status: Joi.string().required(),
    userId: Joi.number().required(),
    missionId: Joi.number().required()
}).options({ abortEarly: false });

export interface ComplianceRequest {
    description: string;
    status: string;
    userId: number;
    missionId: number;
}

export const listComplianceValidation = Joi.object<ListComplianceRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

export interface ListComplianceRequest {
    page?: number;
    limit?: number;
}
