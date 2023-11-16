/*
 *
 * Helper: `createRootFolder`.
 *
 */
import { mkdir } from "fs/promises";
import { join } from "path";
import checkPathExists from "./checkPathExists.mjs";
import findRootYarnWorkSpaces from "./findRootYarnWorkSpaces.mjs";

const createRootFolder = async (folderName) => {
  const rootYarnWorkSpacePath = await findRootYarnWorkSpaces();
  const finalResultsFolderPath = join(rootYarnWorkSpacePath, folderName);

  if (!(await checkPathExists(finalResultsFolderPath))) {
    await mkdir(finalResultsFolderPath, { recursive: true });
  }

  return finalResultsFolderPath;
};

export default createRootFolder;
