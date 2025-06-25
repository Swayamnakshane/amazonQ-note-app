# Notes Web Application

A full-featured note-taking web application built with Node.js, Express, and vanilla JavaScript.

## Features

- **Create, Read, Update, Delete (CRUD)** notes
- **Real-time search** through notes
- **Auto-save** functionality (saves automatically after 2 seconds of inactivity)
- **Responsive design** that works on desktop and mobile
- **File-based storage** (JSON file)
- **Clean, modern UI** with smooth animations
- **Note metadata** showing creation and modification dates

## Installation

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
note-app/
├── server.js          # Express server and API routes
├── package.json       # Node.js dependencies and scripts
├── data/             # Data storage directory
│   └── notes.json    # JSON file storing all notes
└── public/           # Static files served to browser
    ├── index.html    # Main HTML page
    ├── styles.css    # CSS styling
    └── script.js     # Frontend JavaScript
```

## API Endpoints

- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update an existing note
- `DELETE /api/notes/:id` - Delete a note

## Usage

1. **Creating Notes**: Click the "+ New Note" button to create a new note
2. **Editing Notes**: Click on any note in the sidebar to edit it
3. **Searching**: Use the search box to find notes by title or content
4. **Auto-save**: Notes are automatically saved 2 seconds after you stop typing
5. **Manual Save**: Click the "Save" button to save immediately
6. **Deleting**: Click the "Delete" button when editing a note

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: File-based JSON storage
- **Styling**: Custom CSS with responsive design
- **UUID**: For generating unique note IDs

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## Customization

- **Styling**: Modify `public/styles.css` to change the appearance
- **Functionality**: Edit `public/script.js` for frontend behavior
- **API**: Update `server.js` to modify backend functionality
- **Storage**: Currently uses JSON file storage, can be easily modified to use a database

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - feel free to use this project for learning or as a starting point for your own applications.
