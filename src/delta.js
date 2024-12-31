export function importRewindReport(fileHandle) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(JSON.parse(reader.result));
    };
    reader.onerror = () => {
      reader.abort();
      reject(new Error("Error loading rewind report"));
    };
    reader.readAsText(fileHandle);
  });
}

export async function getFeatureDelta(oldReport, newReport) {

  console.log(`oldReport:`, oldReport)
  console.log(`newReport:`, newReport)

  // calculate difference in listening activity
  const uniquePlays = {
    albums: newReport.jellyfinRewindReport.generalStats.uniqueAlbumsPlayed - oldReport.jellyfinRewindReport.generalStats.uniqueAlbumsPlayed,
    artists: newReport.jellyfinRewindReport.generalStats.uniqueArtistsPlayed - oldReport.jellyfinRewindReport.generalStats.uniqueArtistsPlayed,
    tracks: newReport.jellyfinRewindReport.generalStats.uniqueTracksPlayed - oldReport.jellyfinRewindReport.generalStats.uniqueTracksPlayed,
  }

  const totalPlays = {
    average: newReport.jellyfinRewindReport.generalStats.totalPlays.average - oldReport.jellyfinRewindReport.generalStats.totalPlays.average,
    jellyfin: newReport.jellyfinRewindReport.generalStats.totalPlays.jellyfin - oldReport.jellyfinRewindReport.generalStats.totalPlays.jellyfin,
    playbackReport: newReport.jellyfinRewindReport.generalStats.totalPlays.playbackReport - oldReport.jellyfinRewindReport.generalStats.totalPlays.playbackReport,
  }

  // favorites difference
  const favoriteDifference = (newReport.jellyfinRewindReport?.libraryStats?.tracks?.favorite ?? 0) - (oldReport.jellyfinRewindReport?.libraryStats?.tracks?.favorite ?? 0)

  const listeningActivityDifference = {
    uniquePlays: uniquePlays,
    totalPlays: totalPlays,
  }

  return {
    listeningActivityDifference,
    favoriteDifference,
  }
  
}
