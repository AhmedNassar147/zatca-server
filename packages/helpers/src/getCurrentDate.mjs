/*
 *
 * Helper: `getCurrentDate`.
 *
 */
import createDateFromNativeDate from "./createDateFromNativeDate.mjs";

const getCurrentDate = (
  returnReversedDate = false,
  useAmAndPmSegments = false
) =>
  createDateFromNativeDate(Date.now(), {
    returnReversedDate,
    useAmAndPmSegments,
  });

export default getCurrentDate;
