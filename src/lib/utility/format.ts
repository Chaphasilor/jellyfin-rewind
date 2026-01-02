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

export function showAsNumber(number: number | string | undefined) {
  return number?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatArtists(artists: string[] | undefined) {
  if (!artists || artists.length == 0) return "by Unknown Artist";
  const str = "by " + artists.join(" & ");
  if (str.length < 60) return str;
  return str.slice(0, 57) + "...";
}
