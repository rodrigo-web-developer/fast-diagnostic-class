# fast-diagnostic-class
<<<<<<< HEAD
A fast way to create forms and deploy them on a local network to assess the knowledge level of students.

## The idea

You want to check students' level of knowledge in a fast way without using complex tools like Google Forms or other online form services.

You want to create a local test, apply it to students, collect their answers, and receive feedback.

## The solution

Fast Diagnostic Class allows teachers to deploy local network tests to their classes and monitor the results in a real-time dashboard.

Features:
- Create quick questions: description, weight, alternatives, and the correct answer
- Tag questions by area: Math, Logic, History, etc.
- Add "Don't Know" option automatically: creates a form with all questions marked as "I Don't Know" to check baseline knowledge without false positives
- Upload a JSON file with all the questions
- Host questions locally
- Export data to PDF (print page with results)
- Anonymously save answers
- Calculate results: average based on weight of correctly answered questions, max and min for each area, average for each area
- Create locally hosted form (LOCAL_IP:8000/answer) - only one form at a time is available, making it easy to share the link with all students

## Running the solution

- Clone the repo
- Open the folder
- Run `npm install`
- Run `npm run dev`
- The server will run at: localhost:8000
=======

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
>>>>>>> 314773d4019be381ee4dc9acd74dfb148c268e36

## Technologies Used

- **Express.js**: Web server framework
- **Chart.js**: Data visualization library
- **LocalStorage**: Browser-based data persistence
- **Vanilla JavaScript**: Client-side functionality
- **Node.js**: Runtime environment
<<<<<<< HEAD
=======

## License

ISC

>>>>>>> 314773d4019be381ee4dc9acd74dfb148c268e36
