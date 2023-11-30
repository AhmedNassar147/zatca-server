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

const createCmdMessage = ({ type, message, data }) =>
  console.log(
    `${chalk.bold.magenta("[zatca-server]:")} ${chalk[CHALK_COLOR[type]](
      message
    )}`,
    !!data ? JSON.stringify(data, null, 2) : undefined
  );

export default createCmdMessage;
