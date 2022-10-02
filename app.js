const express = require("express");
const app = express();

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/players/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get all players
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    *
    FROM
    cricket_team
    ;`;
  const playersList = await db.all(getPlayersQuery);

  const convertedPlayerList = [];

  for (let player of playersList) {
    let playerDetails = convertDbObjectToResponseObject(player);
    convertedPlayerList.push(playerDetails);
  }
  response.send(convertedPlayerList);
});

// add player API

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerDetailsQuery = `
    INSERT INTO
        cricket_team (player_name, jersey_number, role)
    VALUES
    (
        ${playerName},
        ${jerseyNumber},
        ${role}
    );`;
  const addedPlayerResponse = await db.run(addPlayerDetailsQuery);
  response.send("Player Added to Team");
});

//get player details API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT *
    FROM
        cricket_team
    WHERE
        player_id = ${playerId}
    ;`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//update player details API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const playerDetailsQuery = `
    UPDATE
        cricket_team
    SET
        player_name = ${playerName},
        jersey_number = ${jerseyNumber},
        role = ${role}
    WHERE
        player_id = ${playerId}
    ;`;
  await db.run(playerDetailsQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
        cricket_team
    WHERE
        player_id = ${playerId}
    ;`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
