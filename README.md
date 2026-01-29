# fast-diagnostic-class

Fast way to create forms and apply in a local network to check the average level of knowledge of all students.

## Features

- 📝 Simple diagnostic form for student assessments
- 💾 LocalStorage integration for client-side data persistence
- 📊 Chart.js visualization for score distribution
- 🌐 Express server running on local network (0.0.0.0)
- 💼 Server-side data storage in JSON files
- 📈 Real-time statistics dashboard

## Installation

1. Clone the repository:
```bash
git clone https://github.com/rodrigo-web-developer/fast-diagnostic-class.git
cd fast-diagnostic-class
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Access the application:
   - On the same machine: http://localhost:3000
   - On local network: http://[YOUR-IP]:3000

The server runs on `0.0.0.0:3000`, making it accessible from any device on your local network.

## How It Works

### Frontend (index.html)
- **Form**: Collects student name, subject, score (0-100), and knowledge level
- **LocalStorage**: Automatically saves all submissions in the browser
- **Chart.js**: Displays a bar chart of all student scores
- **Statistics**: Shows total submissions, average score, highest score, and last update time

### Backend (server.js)
- **Express Server**: Handles HTTP requests on port 3000
- **POST /submit-diagnostic**: Receives form data and saves it to a JSON file
- **GET /get-diagnostics**: Retrieves all saved diagnostic data
- **Data Storage**: Saves each submission as a separate JSON file in the `data/` directory

## API Endpoints

### POST /submit-diagnostic
Submit diagnostic data for a student.

**Request Body:**
```json
{
  "studentName": "John Doe",
  "subject": "Math",
  "score": 85,
  "level": "Intermediate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Diagnostic data saved successfully",
  "filename": "diagnostic-1234567890.json"
}
```

### GET /get-diagnostics
Retrieve all saved diagnostic data.

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

## Technologies Used

- **Express.js**: Web server framework
- **Chart.js**: Data visualization library
- **LocalStorage**: Browser-based data persistence
- **Vanilla JavaScript**: Client-side functionality
- **Node.js**: Runtime environment

## License

ISC

