import csv from "csv-parse";
import fs from "fs";
import AppError from "../errors/AppError";

export default function loadCSV(filePath: string): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const result: string[][] = [];

    const fileExists = fs.statSync(filePath);

    if (!fileExists) {
      return reject(new AppError("File not exists"));
    }

    return fs
      .createReadStream(filePath)
      .pipe(csv({ from_line: 2 }))
      .on("data", (data: string[]) =>
        result.push(data.map((o: string) => o.trim())),
      )
      .on("end", () => resolve(result));
  });
}
