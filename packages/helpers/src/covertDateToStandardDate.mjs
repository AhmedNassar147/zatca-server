/*
 *
 * Helper: `covertDateToStandardDate`.
 *
 */
const covertDateToStandardDate = (date) => {
  const dt = new Date(Date.parse(date));
  const localDate = dt;

  const gmt = localDate;
  const min = gmt.getTime() / 1000 / 60; // convert gmt date to minutes
  const localNow = new Date().getTimezoneOffset(); // get the timezone
  // offset in minutes
  const localTime = min - localNow; // get the local time

  const dateStr = new Date(localTime * 1000 * 60);
  return dateStr.toISOString().replace(/\..+Z$/, "Z");
};

export default covertDateToStandardDate;
