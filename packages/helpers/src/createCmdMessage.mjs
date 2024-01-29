/*
 *
 * Helper: `createCmdMessage`.
 *
 */
import chalk from "chalk";

const CHALK_COLOR = {
  error: "red",
  success: "green",
  info: "cyan",
};

const createCmdMessage = ({ type, message, data }) => {
  const log = [
    `${chalk.bold.magenta("[zatca-server]:")} ${chalk[CHALK_COLOR[type]](
      message
    )}`,
    !!data
      ? typeof data === "string"
        ? data
        : JSON.stringify(data, null, 2)
      : "",
  ].filter(Boolean);

  console.log(...log);
};

export default createCmdMessage;
