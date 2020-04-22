import { Router } from "express";
import { getCustomRepository } from "typeorm";
import TransactionsRepository from "../repositories/TransactionsRepository";
import CreateTransactionService from "../services/CreateTransactionService";
import DeleteTransactionService from "../services/DeleteTransactionService";
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get("/", async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionsRepository.getBalance();
  // const transactions = await transactionsRepository
  //   .createQueryBuilder("transactions")
  //   .leftJoinAndSelect("transactions.category", "category");
  const transactions = await transactionsRepository.find({
    // select: ["id", "title", "value", "type", "category_id"],
    relations: ["category"],
  });
  return response.json({ transactions, balance });
});

transactionsRouter.post("/", async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete("/:id", async (request, response) => {
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);

  return response.status(204).send();
});

transactionsRouter.post("/import", async (request, response) => {
  // TODO
});

export default transactionsRouter;