/*
 *
 * Helper: `createRootFolder`.
 *
 */
import { mkdir } from "fs/promises";
import { join } from "path";
import checkPathExists from "./checkPathExists.mjs";
import findRootYarnWorkSpaces from "./findRootYarnWorkSpaces.mjs";

const createRootFolder = async (folderName, skipRootPath) => {
  const paths = [folderName];

  if (!skipRootPath) {
    const rootYarnWorkSpacePath = await findRootYarnWorkSpaces();
    paths.unshift(rootYarnWorkSpacePath);
  }

  const finalResultsFolderPath = join(...paths);

  if (!(await checkPathExists(finalResultsFolderPath))) {
    await mkdir(finalResultsFolderPath, { recursive: true });
  }

  return finalResultsFolderPath;
};

export default createRootFolder;
