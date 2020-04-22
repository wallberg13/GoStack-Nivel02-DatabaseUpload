import { EntityRepository, Repository } from "typeorm";

import Transaction from "../models/Transaction";

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (acumulate: Balance, current: Transaction) => {
        const acc = acumulate;
        acc[current.type] += Number(current.value);

        return acc;
      },
      { income: 0, outcome: 0, total: 0 },
    );
    balance.total = balance.income - balance.outcome;
    return balance;
  }
}

export default TransactionsRepository;
