"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenditureUsecase = void 0;
const user_1 = require("../database/entities/user");
const expenditure_1 = require("../database/entities/expenditure");
class ExpenditureUsecase {
    constructor(db) {
        this.db = db;
    }
    listExpenditure(listExpenditureFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(listExpenditureFilter);
            const query = this.db.getRepository(expenditure_1.Expenditures)
                .createQueryBuilder('expenditures')
                .leftJoinAndSelect('expenditures.user', 'user');
            if (listExpenditureFilter.id) {
                const user = yield this.db.getRepository(user_1.User)
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
            const [expenses, totalCount] = yield query.getManyAndCount();
            return {
                expenses,
                totalCount
            };
        });
    }
}
exports.ExpenditureUsecase = ExpenditureUsecase;
