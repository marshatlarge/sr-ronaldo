// Variables to store parsed data
const competitions = {};
const people = {};
const stats = [];
const teams = {};

// Function to calculate goals per 90 minutes
const goalsPer90 = (goals, minutes) => ((goals / minutes) * 90).toFixed(2);

// Function to calculate age
const calculateAge = (birthDate, season) => {
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

// Function to create and append the table to the DOM
const createTable = (playerStats) => {
  // Create table and thead elements
  const table = document.createElement("table");
  const thead = table.createTHead();
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  // Define the header row
  const headerRow = thead.insertRow();
  [
    "Season",
    "Age",
    "Team",
    "Country",
    "Competition",
    "Games",
    "Minutes",
    "Goals",
    "Assists",
    "Goals/90",
  ].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });

  // Fill the table body with player stats
  playerStats.forEach((stat) => {
    const row = tbody.insertRow();
    row.insertCell().textContent = stat.season;
    row.insertCell().textContent = stat.age;
    row.insertCell().textContent = teams[stat.team_id].name;
    row.insertCell().textContent = teams[stat.team_id].country;
    row.insertCell().textContent = competitions[stat.comp_id].name;
    row.insertCell().textContent = stat.games;
    // Format minutes with commas
    row.insertCell().textContent = Number(stat.minutes).toLocaleString();
    row.insertCell().textContent = stat.goals;
    row.insertCell().textContent = stat.assists;
    row.insertCell().textContent = goalsPer90(stat.goals, stat.minutes);
  });

  // Add the table to the body
  // Inside your createTable function, before appending the table to the body
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  wrapper.appendChild(table);
  document.body.appendChild(wrapper);
};

// CSV parser function removes quotations
const parseCSV = (csvText) => {
  const lines = csvText.trim().split("\n");
  const headers = lines
    .shift()
    .split(",")
    .map((header) => header.trim().replace(/^"|"$/g, "")); // Remove quotes from headers too, if present
  return lines.map((line) => {
    const data = line
      .split(",")
      .map((value) => value.trim().replace(/^"|"$/g, "")); // Remove quotes from each value
    return headers.reduce((obj, nextKey, index) => {
      obj[nextKey] = data[index];
      return obj;
    }, {});
  });
};

// Function to load and parse CSV data
const loadCSVs = async () => {
  // Load all CSV data asynchronously
  const compResponse = await fetch("./data/sr_dev_competitions.csv");
  const peopleResponse = await fetch("./data/sr_dev_people.csv");
  const teamResponse = await fetch("./data/sr_dev_teams.csv");
  const statsResponse = await fetch("./data/sr_dev_stats.csv");

  const compCSV = await compResponse.text();
  const peopleCSV = await peopleResponse.text();
  const teamCSV = await teamResponse.text();
  const statsCSV = await statsResponse.text();

  // Parse and store competition data
  parseCSV(compCSV).forEach((d) => (competitions[d.comp_id] = d));

  // Parse and store people data
  parseCSV(peopleCSV).forEach((d) => (people[d.person_id] = d));

  // Get ronaldo's birthdate
  const ronaldoPersonId = Object.keys(people).find(
    (id) => people[id].name === "Cristiano Ronaldo"
  );
  const ronaldoBirthDate = new Date(people[ronaldoPersonId].birth_date);

  // Parse and store team data
  parseCSV(teamCSV).forEach((d) => (teams[d.team_id] = d));

  // Process stats
  const ronaldoDomesticStats = parseCSV(statsCSV)
    .filter(
      (stat) =>
        people[stat.person_id]?.name === "Cristiano Ronaldo" &&
        competitions[stat.comp_id]?.scope === "domestic" &&
        competitions[stat.comp_id]?.competition_format === "league"
    )
    .sort((a, b) => a.season.localeCompare(b.season))
    .map((stat) => ({
      ...stat,
      age: calculateAge(ronaldoBirthDate, stat.season),
    }));

  createTable(ronaldoDomesticStats);
};

// Run the CSV loading when the window loads
window.onload = loadCSVs;
