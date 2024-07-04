import { DataSource } from "typeorm";
import { AppDataSource } from "../database/database";
import { User } from "../database/entities/user";
import { Expenditures } from "../database/entities/expenditure";

export interface ListExpenditureFilter {
    limit: number;
    page: number;
    id?: number;
}

export class ExpenditureUsecase {
    constructor(private readonly db: DataSource) {}

    async listExpenditure(listExpenditureFilter: ListExpenditureFilter): Promise<{ expenses: Expenditures[]; totalCount: number; } | string> {
        console.log(listExpenditureFilter);
        const query = this.db.getRepository(Expenditures)
            .createQueryBuilder('expenditures')
            .leftJoinAndSelect('expenditures.user', 'user');
    
        if (listExpenditureFilter.id) {
            const user = await this.db.getRepository(User)
                .createQueryBuilder('user')
                .where('user.id = :id', { id: listExpenditureFilter.id })
                .andWhere('user.isDeleted = false')
                .getOne();
    
            if (!user) {
                return `Nothing Found !!! from userId: ${listExpenditureFilter.id}`;
            }
    
            query.andWhere('expenditures.userId = :userId', { userId: listExpenditureFilter.id });
        }
    
        query.skip((listExpenditureFilter.page - 1) * listExpenditureFilter.limit)
            .take(listExpenditureFilter.limit);
    
        const [expenses, totalCount] = await query.getManyAndCount();
        return {
            expenses,
            totalCount
        };
    }
    
}
