// statCalculator.js
export const goalsPer90 = (goals, minutes) =>
  ((goals / minutes) * 90).toFixed(2);

export const calculateAge = (birthDate, season) => {
  const seasonStartYear = parseInt(season.split("-")[0]);
  const seasonStartDate = new Date(seasonStartYear, 6, 1); // Assuming season starts in July
  let age = seasonStartDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = seasonStartDate.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && seasonStartDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};
