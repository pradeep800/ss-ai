import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
export function getIndianTime(isoString = new Date().toISOString()) {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const day = dayjs(isoString).tz("Asia/Kolkata");
  return {
    day: day.date(),
    month: day.month() + 1,
    year: day.year(),
  };
}
