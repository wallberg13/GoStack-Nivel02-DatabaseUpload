import { Router } from "express";
import { getCustomRepository } from "typeorm";
import multer from "multer";
import TransactionsRepository from "../repositories/TransactionsRepository";
import CreateTransactionService from "../services/CreateTransactionService";
import DeleteTransactionService from "../services/DeleteTransactionService";
import ImportTransactionsService from "../services/ImportTransactionsService";

import configUpload from "../config/upload";

const transactionsRouter = Router();

const fileUpload = multer(configUpload);

transactionsRouter.get("/", async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionsRepository.getBalance();
  const transactions = await transactionsRepository.find({
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

transactionsRouter.post(
  "/import",
  fileUpload.single("file"),
  async (request, response) => {
    const { file } = request;

    const importTransactionsService = new ImportTransactionsService();
    const transactions = await importTransactionsService.execute(file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
