const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "covid19India.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertStateDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

const covertDistrictDbObjectToResponse = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

// API 1 GET METHOD
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
        SELECT 
            * 
        FROM 
            state;`;
  const stateArray = await database.all(getStatesQuery);
  response.send(stateArray);
});

// API 2 GET METHOD
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStatesQuery = `
        SELECT 
            *
        FROM 
            state 
        WHERE 
            state_id = "${stateId};`;
  const state = await database.get(getStatesQuery);
  response.send(convertStateDbObjectToResponseObject(state));
});

// API 3 GET METHOD
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postDistrictQuery = `
        INSERT INTO 
            district ( district_name , state_id , cases , cured , active , deaths )
        VALUES ( "${districtName}" , "${stateId}" , "${cases}" , "${cured}" , "${active}" , "${deaths}" );`;
  await database.run(postDistrictQuery);
  response.send("District Successfully Added");
});

// API 4 GET METHOD
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
        SELECT 
            *
        FROM 
            district
        WHERE 
            districtId = "${districtId}";`;

  const districtArray = await database.all(getDistrictQuery);
  response.send(districtArray);
});

// API 5 DELETE METHOD

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDeleteQuery = `
            DELETE FROM district
            WHERE 
                district_id = "${districtId}";`;
  await database.run(districtDeleteQuery);
  response.send(
    "Deletes a district from the district table based on the district ID"
  );
});
