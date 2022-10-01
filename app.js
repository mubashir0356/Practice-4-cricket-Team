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

//get all players
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    *
    FROM
        cricket_team
    ORDER BY
        player_id
    ;`;
  const playersList = await db.all(getPlayersQuery);

  const convertedPlayerList = [];

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

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
        cricket_team (playerName, jerseyNumber, role)
    VALUES
    (
        ${playerName},
        ${jerseyNumber},
        ${role}
    );`;
  const addedPlayerResponse = await db.run(addPlayerDetailsQuery);
  response.send("Player Added to Team");
  console.log(addedPlayerResponse);
});

//get player details API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT *
    FROM
        cricket_team
    WHERE
        playerId = ${playerId}
    ;`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
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
        playerName = ${playerName},
        jerseyNumber = ${jerseyNumber},
        role = ${role}
    WHERE
        playerId = ${playerId}
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
        playerId = ${playerId}
    ;`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
