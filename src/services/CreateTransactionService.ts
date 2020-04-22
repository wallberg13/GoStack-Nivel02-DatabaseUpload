import { getCustomRepository, getRepository } from "typeorm";

import AppError from "../errors/AppError";
import TransactionsRepository from "../repositories/TransactionsRepository";
import Transaction from "../models/Transaction";
import Category from "../models/Category";

interface Request {
  title: string;
  value: number;
  type: "income" | "outcome";
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type === "outcome") {
      const { total } = await transactionsRepository.getBalance();
      if (value > total) {
        throw new AppError("Wallet without funds. Please make a deposit.");
      }
    }

    let categoryDB = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryDB) {
      categoryDB = categoriesRepository.create({ title: category });
      await categoriesRepository.save(categoryDB);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryDB.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
