# fast-diagnostic-class
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

## JSON Example

Create form:

```json
{
    "questions": [{
        "idk": true, // add I Don't Know alternative for better precision on results
        "alternatives": ["2", "4", "8", "NDA"],
        "description": "How much is 2 + 2?",
        "correct": 1, // index based answer,
        "tags": ["math", "sum"] // tag answer for better dashboard results
    },{
        "idk": true,
        "alternatives": ["2", "4", "8", "NDA"],
        "description": "How much is 2 x 2?",
        "correct": 1,
        "tags": ["math", "mult"] // tag answer for better dashboard results
    }],
    "title": "Basics of math"
}
```

Open form (supress tags and correct answer):

```json
{
    "questions": [{
        "idk": true,
        "alternatives": ["2", "4", "8", "NDA"],
        "description": "How much is 2 + 2?"
    },{
        "idk": true,
        "alternatives": ["2", "4", "8", "NDA"],
        "description": "How much is 2 x 2?"
    }],
    "title": "Basics of math"
}
```


Send answer: 
```json
{
    "name": "John Doe",
    "answers": [1, null] // same question sequence, IDK = null
}
```


## Technologies Used

- **Express.js**: Web server framework
- **Chart.js**: Data visualization library
- **LocalStorage**: Browser-based data persistence
- **Vanilla JavaScript**: Client-side functionality
- **Node.js**: Runtime environment
