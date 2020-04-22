import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export default class AddCategoryFieldInTransactions1587513372797
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "transactions",
      new TableColumn({
        name: "category_id",
        type: "uuid",
        isNullable: true,
      }),
    );

    /**
     * Criando a FK entre Category e Transaction
     */
    await queryRunner.createForeignKey(
      "transactions",
      new TableForeignKey({
        name: "TransactionCategoryFK",
        columnNames: ["category_id"],
        referencedTableName: "categories",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("transactions", "TransactionCategoryFK");

    await queryRunner.dropColumn("transactions", "category_id");
  }
}
