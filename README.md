# City of Toronto Shelter Dashboard - Server

A Node.js/Express.js backend server that provides API endpoints for accessing Toronto's shelter system data, housing waitlist information, and related social services data from the City of Toronto Open Data portal.

## 🏗️ Overview

This server application acts as a middleware layer between the React frontend and Toronto's Open Data portal. It fetches, processes, and serves shelter occupancy data, housing waitlist information, system flow metrics, and historical data through a RESTful API.

## ✨ Features

### 📊 Data Integration
- **Real-time Data Fetching**: Direct integration with Toronto's Open Data portal
- **Multiple Dataset Support**: Handles various data formats (JSON, CSV)
- **Data Processing**: Transforms raw API responses into frontend-friendly formats
- **Error Handling**: Robust error handling and logging

### 🔌 API Endpoints
- **GET** `/api/shelter-dashboard` - Comprehensive shelter and housing data endpoint
- **CORS Support**: Cross-origin resource sharing enabled for frontend integration
- **JSON Responses**: Structured JSON responses with metadata and data arrays

### 🛡️ Data Sources
The server integrates with the following Toronto Open Data datasets:
- **Shelter Occupancy**: Current shelter capacity and occupancy rates
- **Housing Waitlist**: Centralized waiting list activity for social housing
- **System Flow**: Toronto Shelter System flow metrics and statistics
- **Historical Data**: Daily shelter occupancy records (2020)
- **Deaths Data**: Shelter resident death statistics

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js 4.21.2
- **HTTP Client**: Axios 1.7.9
- **CORS**: cors 2.8.5
- **Environment**: dotenv 16.4.7
- **Data Source**: Toronto Open Data Portal (CKAN API)

## 📋 Prerequisites

Before running this server, ensure you have:

- **Node.js**: Version 14.0 or higher
- **npm**: Version 6.0 or higher (comes with Node.js)
- **Internet Connection**: Required for accessing Toronto's Open Data portal

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd toapiserver
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (optional):
```env
PORT=3001
HOSTNAME=127.0.0.1
```

### 4. Start the Server
```bash
npm start
```

The server will start on `http://localhost:3001`

## 📁 Project Structure

```
toapiserver/
├── server.js                    # Main server file with Express setup
├── index.js                     # Alternative entry point
├── package.json                 # Dependencies and scripts
├── shelter_list.json           # Generated shelter location data
├── shelter_coordinates.json    # Shelter coordinate data
└── README.md                   # This file
```

## 🔧 Available Scripts

### `npm start`
Starts the Express server on the configured port (default: 3001).

### `npm test`
Runs the test suite (currently configured to start the server).

## 🌐 API Documentation

### Base URL
```
http://localhost:3001
```

### Endpoints

#### GET `/api/shelter-dashboard`
Fetches comprehensive shelter and housing data from Toronto's Open Data portal.

**Response Format:**
```json
{
  "metadata": [
    {
      "id": "dataset-id",
      "name": "Dataset Name",
      "resources": [...]
    }
  ],
  "data": [
    occupancyData,      // Array of shelter occupancy records
    waitlistData,       // Array of housing waitlist records
    flowData,          // Array of system flow metrics
    deathsData,        // Array of death statistics (optional)
    historicalData     // Array of historical occupancy records
  ]
}
```

**Example Response:**
```json
{
  "metadata": [...],
  "data": [
    [
      {
        "LOCATION_NAME": "Shelter Name",
        "LOCATION_ADDRESS": "123 Main St",
        "UNOCCUPIED_BEDS": 5,
        "OCCUPIED_BEDS": 45
      }
    ],
    [...],
    [...],
    [...],
    [...]
  ]
}
```

## 🔍 Data Processing

### Dataset IDs
The server fetches data from the following Toronto Open Data datasets:

```javascript
const datasetIds = [
  "21c83b32-d5a8-4106-a54f-010dbe49f6f2",  // Shelter occupancy
  "centralized-waiting-list-activity-for-social-housing",  // Housing waitlist
  "ac77f532-f18b-427c-905c-4ae87ce69c93",  // System flow
  "deaths-of-shelter-residents",            // Deaths data
  "8a6eceb2-821b-4961-a29d-758f3087732d"   // Historical occupancy
];
```

### Data Flow
1. **Fetch Metadata**: Retrieves dataset information from CKAN API
2. **Resource Selection**: Prioritizes JSON format, falls back to CSV
3. **Data Retrieval**: Fetches actual data records from datastore
4. **Response Assembly**: Combines metadata and data into structured response

## 🛡️ Error Handling

The server includes comprehensive error handling:

- **API Connection Errors**: Handles network timeouts and connection failures
- **JSON Parsing Errors**: Validates and parses API responses safely
- **Data Validation**: Ensures data integrity before sending to frontend
- **HTTP Status Codes**: Proper status codes for different error scenarios

## 🔧 Configuration

### Server Configuration
```javascript
const hostname = '127.0.0.1';
const port = 3001;
```

### CORS Configuration
```javascript
const cors = require('cors');
app.use(cors()); // Allows all origins in development
```

## 🚀 Deployment

### Production Considerations
1. **Environment Variables**: Use `.env` file for production configuration
2. **CORS**: Configure specific origins for production
3. **Rate Limiting**: Consider implementing rate limiting for API calls
4. **Caching**: Implement caching for frequently requested data
5. **Monitoring**: Add logging and monitoring for production use

### Deployment Options
- **Heroku**: Easy deployment with Procfile
- **AWS EC2**: Full control over server environment
- **DigitalOcean**: Cost-effective VPS deployment
- **Railway**: Modern deployment platform

### Example Heroku Deployment
```bash
# Install Heroku CLI
# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## 🔍 Monitoring and Logging

### Current Logging
- Server startup confirmation
- API response debugging
- Error logging for failed requests

### Recommended Enhancements
- **Winston**: Structured logging library
- **Morgan**: HTTP request logger
- **Health Check**: Endpoint for monitoring server status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Thomas Gibson** - *Initial work* - [GitHub Profile]

## 🙏 Acknowledgments

- **City of Toronto**: For providing comprehensive open data
- **CKAN**: Open source data management system
- **Express.js Community**: For excellent documentation and support

## 📞 Support

For support, email [your-email@example.com] or create an issue in the repository.

## 🔗 Related Projects

- **Frontend Client**: [City of Toronto Shelter Dashboard - Client](../toapi/README.md)
- **Toronto Open Data Portal**: [https://open.toronto.ca/](https://open.toronto.ca/)

---

**Note**: This server is designed to work with the companion React frontend application. Make sure both applications are running for full functionality.
