const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs'); // Import file system module

// Allow frontend to access the server (CORS issue prevention)
const cors = require('cors');
app.use(cors());

// Server setup
const hostname = '127.0.0.1';
const port = 3001;

const datasetIds = [
                    //shelter list occupancy and capacity #1
                    "21c83b32-d5a8-4106-a54f-010dbe49f6f2", 
                
                    //Centralized Waiting List Activity for Social Housing
                    "centralized-waiting-list-activity-for-social-housing",
                    
                    // //Toronto Shelter System Flow
                    "ac77f532-f18b-427c-905c-4ae87ce69c93",
                   
                    // //Deaths of Shelter Residents
                    "deaths-of-shelter-residents",

                    // //Daily Shelter Occupancy. WILL NOT BE REFRESHED.
                    "8a6eceb2-821b-4961-a29d-758f3087732d",
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


app.get('/api/shelter-dashboard', async (req, res) => {
    try {
        // Fetch metadata for all required datasets
        const datasetMetadata = await Promise.all(datasetIds.map(fetchDataset));

        // Extract relevant data for each dataset
        const allResources = datasetMetadata.map(pkg => {
            if (!pkg.resources) return null;

            // Prioritize JSON, fallback to CSV if needed
            let jsonResource = pkg.resources.find(r => r.datastore_active && r.format === "JSON");
            let csvResource = pkg.resources.find(r => r.datastore_active && r.format === "CSV");
            return jsonResource || csvResource;
        }).filter(resource => resource);

        // Fetch actual data for all selected resources
        const allData = await Promise.all(
            allResources.map(resource => fetchDatastoreResource(resource.id))
        );

        // Debugging: Log the first dataset to inspect its structure
        console.log("Debugging allData[0]:", JSON.stringify(allData[0], null, 4));

        // Assuming the first dataset contains shelter information
        const shelterData = allData[0]; // Adjust index if necessary
        if (!shelterData || !Array.isArray(shelterData)) {
            console.error("❌ No valid shelter data found in allData[0]");
            res.status(500).json({ error: "No valid shelter data found." });
            return;
        }

        // Extract shelter names and addresses
        const shelterList = shelterData.map(shelter => ({
            name: shelter["LOCATION_NAME"], // Replace with the correct key
            address: shelter["LOCATION_ADDRESS"], // Replace with the correct key
            latitude: null,
            longitude: null
        })).filter(shelter => shelter.name && shelter.address); // Filter out incomplete entries

        // Debugging: Log the shelter list
        // console.log("Extracted Shelter List:", JSON.stringify(shelterList, null, 4));

        // Save shelter list to JSON file
        // fs.writeFileSync('shelter_list.json', JSON.stringify(shelterList, null, 4), 'utf-8');
        // console.log("✅ Shelter list saved to 'shelter_list.json'");

        res.json({ metadata: datasetMetadata, data: allData });
    } catch (error) {
        console.error("❌ Error fetching shelter data:", error);
        res.status(500).json({ error: 'Error fetching shelter and housing data' });
    }
});




app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});