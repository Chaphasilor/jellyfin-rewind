export const formatDateToSql = (d: Date) =>
  `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${
    d
      .getDate()
      .toString()
      .padStart(2, "0")
  }`;

export function secondsToTimeStamp(s: number) {
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor(s / 60) % 60;
  const seconds = s % 60;
  return (
    "" +
    hours.toString().padStart(2, "0") +
    " hours " +
    minutes.toString().padStart(2, "0") +
    " minutes " +
    seconds.toString().padStart(2, "0") +
    " seconds"
  );
}
