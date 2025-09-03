const express = require('express');
const app = express();
const https = require('https');

// Allow frontend to access the server (CORS issue prevention)
const cors = require('cors');
app.use(cors());

// Server setup
const hostname = '127.0.0.1';
const port = 3001;

const datasetIds = [
                    //shelter list occupancy and capacity
                    "21c83b32-d5a8-4106-a54f-010dbe49f6f2", 
                    //Cost of living in Toronto for low-income households
                    // "52182614-1f0b-42be-aca4-3f86dc8e004c",
                    //Members of Toronto City Council - Voting Record
                    // "7f5232d6-0d2a-4f95-864a-417cbf341cc4", 
                    //Centralized Waiting List Activity for Social Housing
                    "centralized-waiting-list-activity-for-social-housing",
                    //Toronto Shelter System Flow
                    "ac77f532-f18b-427c-905c-4ae87ce69c93",
                    //Central Intake calls
                    "central-intake-calls",
                    //Lobbyist Registry
                    // "6a87b8bf-f4df-4762-b5dc-bf393336687b",
                    //Polls conducted by the City
                    // "7bce9bf4-be5c-4261-af01-abfbc3510309",
                    //Deaths of Shelter Residents
                    "deaths-of-shelter-residents",
                    //Fatal and non-fatal suspected opioid overdoses in the shelter system
                    "0d1fb545-d1b2-4e0a-b87f-d8a1835e5d85",
                    //Daily Shelter Occupancy. WILL NOT BE REFRESHED.
                    "8a6eceb2-821b-4961-a29d-758f3087732d",
                    //Transport Bus Initiative Usage
                     "transport-bus-initiative-usage",
                     //Hostel Services: Homeless Shelter Locations
                     "24b2b6ff-35b9-481d-9eb6-ba2e5e8b4dfb",
                     //Drop-In Locations (Toronto Drop-In Network Members - TDIN)
                     "308ea197-5ed8-4f72-9d58-9a5ad7cbf679",
                     //2018 Street Needs Assessment Results
                     // "77fc81fc-dad7-41c8-953f-f57ad9c5fcb0",
                     //Social Housing - Wait List , Rent Bank Loans Granted and Shelter Use Summary
                     "76cdd131-e66c-4ef1-855c-ae6611915f2c",
                     //2013 Street Needs Assessment Results
                     // "da3f62ec-2bd5-4ef6-9a6e-2a73ef3436f6",
                     //Shelter Profile Information
                      "1643a780-b01c-4a1d-b6b3-2c0538d111b3"
                      ]

// Function to fetch a dataset
const fetchDataset = (packageId) => {
    return new Promise((resolve, reject) => {
        https.get(`https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/package_show?id=${packageId}`, (response) => {
            let dataChunks = [];
            response
                .on("data", (chunk) => dataChunks.push(chunk))
                .on("end", () => {
                    let rawData = Buffer.concat(dataChunks).toString();
                    // console.log("🔍 Raw API Response:", rawData); // Log response before parsing

                    try {
                        let jsonData = JSON.parse(rawData);
                        resolve(jsonData["result"]);
                    } catch (error) {
                        console.error("❌ JSON Parsing Error:", error.message);
                        reject("Invalid JSON received from API");
                    }
                })
                .on("error", (error) => reject(error));
        });
    });
};


// Fetch resources from a dataset
const fetchDatastoreResource = (resourceId) => {
    return new Promise((resolve, reject) => {
        https.get(`https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?id=${resourceId}`, (response) => {
            let dataChunks = [];
            response
                .on("data", (chunk) => dataChunks.push(chunk))
                .on("end", () => {
                    let data = Buffer.concat(dataChunks);
                    resolve(JSON.parse(data.toString())["result"]["records"]);
                    // console.log("Resources Data:",JSON.parse(data.toString())["result"]["records"]);
                })
                .on("error", (error) => reject(error));
        });
    });
};

// Express Route to Fetch All 14 Datasets
// Express Route to Fetch All 14 Datasets
app.get('/api/shelters-and-services', async (req, res) => {
    try {
        // Fetch metadata for all datasets
        const datasetMetadata = await Promise.all(datasetIds.map(fetchDataset));

        // Extract active resources, prioritizing JSON but falling back to CSV (within each dataset)
        const allResources = datasetMetadata.flatMap(pkg => {
            if (!pkg.resources) return []; // Skip datasets with no resources

            // Select JSON first, otherwise fallback to CSV
            let jsonResource = pkg.resources.find(r => r.datastore_active && r.format === "JSON");
            let csvResource = pkg.resources.find(r => r.datastore_active && r.format === "CSV");
            return jsonResource || csvResource ? [jsonResource || csvResource] : []; // Wrap in array for flatMap()
        });

        // Log filtered resources
        // console.log("Filtered Resources:", allResources);

        // Fetch data for all valid resources
        const allData = await Promise.all(
            allResources.map(resource => fetchDatastoreResource(resource.id))
        );

        res.json({ metadata: datasetMetadata, data: allData });
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.status(500).json({ error: 'Error fetching shelter and social services data' });
    }
});




app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});