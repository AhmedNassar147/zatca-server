/*
 *
 * Helper: `writeResultFile`.
 *
 */

import { writeFile } from "fs/promises";
import getCurrentDate from "./getCurrentDate.mjs";
import checkPathExists from "./checkPathExists.mjs";
import readJsonFile from "./readJsonFile.mjs";
import createRootFolder from "./createRootFolder.mjs";

const writeResultFile = async ({ data, folderName }) => {
  const { dateString, time } = getCurrentDate();
  const finalResultsFolderPath = await createRootFolder(
    `results/${folderName}`
  );

  const currentResultFilePath = `${finalResultsFolderPath}/${dateString}.json`;

  let previousResultFileData = [];

  if (await checkPathExists(currentResultFilePath)) {
    previousResultFileData = await readJsonFile(currentResultFilePath, true);
  }

  const nextFileResults = [
    ...(Array.isArray(data)
      ? data.map((item) => ({
          time,
          ...item,
        }))
      : [
          {
            time,
            ...data,
          },
        ]),
    ...(previousResultFileData || []),
  ];

  await writeFile(
    currentResultFilePath,
    JSON.stringify(nextFileResults, null, 2)
  );
};

export default writeResultFile;
