import { parseCSV } from "./modules/csvParser.js";
import { goalsPer90, calculateAge } from "./modules/statCalculator.js";

const competitions = {};
const people = {};
const teams = {};

const createTable = (playerStats) => {
  const table = document.createElement("table");
  const thead = table.createTHead();
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

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

  let totalGames = 0,
    totalMinutes = 0,
    totalGoals = 0,
    totalAssists = 0;
  const competitionsSet = new Set();
  const seasonsSet = new Set();
  const teamsSet = new Set();

  playerStats.forEach((stat) => {
    totalGames += Number(stat.games);
    totalMinutes += Number(stat.minutes);
    totalGoals += Number(stat.goals);
    totalAssists += Number(stat.assists);
    competitionsSet.add(stat.comp_id);
    seasonsSet.add(stat.season);
    teamsSet.add(stat.team_id);
  });

  const totalGoalsPer90 = (totalGoals / totalMinutes) * 90;
  const distinctCompetitions = competitionsSet.size;
  const distinctSeasons = seasonsSet.size;
  const distinctTeams = teamsSet.size;

  playerStats.forEach((stat) => {
    const row = tbody.insertRow();
    row.insertCell().textContent = stat.season;
    row.insertCell().textContent = calculateAge(
      new Date(people[stat.person_id].birth_date),
      stat.season
    );
    row.insertCell().textContent = teams[stat.team_id].name;
    row.insertCell().textContent = teams[stat.team_id].country;
    row.insertCell().textContent = competitions[stat.comp_id].name;
    row.insertCell().textContent = stat.games;
    row.insertCell().textContent = Number(stat.minutes).toLocaleString();
    row.insertCell().textContent = stat.goals;
    row.insertCell().textContent = stat.assists;
    row.insertCell().textContent = goalsPer90(stat.goals, stat.minutes);
  });

  const totalsRow = tbody.insertRow();
  totalsRow.style.backgroundColor = "#f2f2f2";
  totalsRow.insertCell().textContent = `${distinctSeasons} Seasons`;
  totalsRow.insertCell().textContent = "";
  totalsRow.insertCell().textContent = `${distinctTeams} Clubs`;
  totalsRow.insertCell().textContent = "";
  totalsRow.insertCell().textContent = `${distinctCompetitions} Competitions`;
  totalsRow.insertCell().textContent = totalGames.toLocaleString();
  totalsRow.insertCell().textContent = totalMinutes.toLocaleString();
  totalsRow.insertCell().textContent = totalGoals.toLocaleString();
  totalsRow.insertCell().textContent = totalAssists.toLocaleString();
  totalsRow.insertCell().textContent = totalGoalsPer90.toFixed(2);

  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  wrapper.appendChild(table);
  document.body.appendChild(wrapper);
};

const loadCSVs = async () => {
  const compResponse = await fetch("./data/sr_dev_competitions.csv");
  const peopleResponse = await fetch("./data/sr_dev_people.csv");
  const teamResponse = await fetch("./data/sr_dev_teams.csv");
  const statsResponse = await fetch("./data/sr_dev_stats.csv");

  const compCSV = await compResponse.text();
  const peopleCSV = await peopleResponse.text();
  const teamCSV = await teamResponse.text();
  const statsCSV = await statsResponse.text();

  parseCSV(compCSV).forEach((d) => (competitions[d.comp_id] = d));
  parseCSV(peopleCSV).forEach((d) => (people[d.person_id] = d));
  parseCSV(teamCSV).forEach((d) => (teams[d.team_id] = d));

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
      age: calculateAge(
        new Date(people[stat.person_id].birth_date),
        stat.season
      ),
    }));

  createTable(ronaldoDomesticStats);
};

window.onload = loadCSVs;
