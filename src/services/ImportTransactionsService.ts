import { getRepository, In, getCustomRepository } from "typeorm";
import fs from "fs";
import Transaction from "../models/Transaction";
import loadCSV from "../helpers/loadCSV";
import Category from "../models/Category";
import TransactionsRepository from "../repositories/TransactionsRepository";
// Stackoverflow
function onlyUnique(value: string, index: number, self: string[]): boolean {
  return self.indexOf(value) === index;
}

interface TransactionsCSV {
  title: string;
  type: "income" | "outcome";
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const loadedCSV = await loadCSV(filePath);

    const transactionsCSV: TransactionsCSV[] = [];
    const categoriesCSV: string[] = [];

    loadedCSV.forEach((singleTransaction: string[]) => {
      const [title, type, value, category] = singleTransaction;
      const transactionCSV = {
        title,
        type,
        value: Number(value),
        category,
      } as TransactionsCSV;

      // Array com 4 posições, é o default
      if (singleTransaction.length === 4) {
        transactionsCSV.push(transactionCSV);
        categoriesCSV.push(category);
      }
    });

    // Primeiro, verificando e encontrando as categorias.
    const categoriesRepository = getRepository(Category);
    const categoriesDB = await categoriesRepository.find({
      where: {
        title: In(categoriesCSV),
      },
    });

    // Obtendo o pessoal que nao existe no banco
    let categoriesCandidate = categoriesCSV.filter(
      (category: string) =>
        categoriesDB.findIndex((o: Category) => o.title === category) < 0,
    );

    // Obtendo somente os unicos
    categoriesCandidate = categoriesCandidate.filter(onlyUnique);

    // Passando por cada categoria, e criando as mesmas
    const newCategories = categoriesRepository.create(
      categoriesCandidate.map(title => ({
        title,
      })),
    );

    console.log(newCategories);

    // Salvando elas no banco.
    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...categoriesDB];

    // Sem tratar os erros
    // Agora, as transações
    /**
     * MAP RESOLVE QUASE TUDO!!!
     */
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const createdTransactions = transactionsRepository.create(
      transactionsCSV.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
