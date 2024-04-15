import { DataSource } from "typeorm";
import { EvenementCategory } from "../database/entities/evenement-category";

export interface ListEvenementCategoryFilter {
    limit: number;
    page: number;
}

export class EvenementCategoryUsecase {
    constructor(private readonly db: DataSource) { }

    async listEvenementCategory(listEvenementCategoryFilter: ListEvenementCategoryFilter): Promise<{ categories: EvenementCategory[]; totalCount: number; }> {
        console.log(listEvenementCategoryFilter);
        const query = this.db.createQueryBuilder(EvenementCategory, 'category');

        query.skip((listEvenementCategoryFilter.page - 1) * listEvenementCategoryFilter.limit);
        query.take(listEvenementCategoryFilter.limit);

        const [categories, totalCount] = await query.getManyAndCount();
        return {
            categories,
            totalCount
        };
    }
}
