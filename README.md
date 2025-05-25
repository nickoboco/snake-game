# Web Snake Game

A classic Snake game implemented as a web application using Python Flask for the backend and standard web technologies (HTML, CSS, JavaScript) for the frontend.

## Features

*   **Web-based:** Play directly in your browser.
*   **Selectable Grid Size:** Choose from Small (10x10), Medium (20x20), or Large (30x30) grid sizes.
*   **Difficulty Levels:** Select between Easy, Medium, and Hard difficulties, which control the initial speed of the snake.
*   **Gradual Speed Increase:** The snake's speed increases slightly each time it eats food, making the game progressively more challenging.
*   **Pause/Resume:** Pause and resume the game during gameplay.
*   **Restart:** Restart the current game or return to the settings screen from the game over screen or during gameplay.
*   **Countdown:** A short countdown before the game starts.
*   **Score Tracking:** Displays your current score.
*   **Game Over Screen:** Shows your final score when the game ends.

## Technologies Used

*   **Backend:** Python 3, Flask
*   **Frontend:** HTML5, CSS3, JavaScript
*   **Templating:** Jinja2 (via Flask)

## Setup and Running

1.  **Clone or Download:** Get the project files.
2.  **Install Python:** Make sure you have Python 3 installed.
3.  **Install Flask:** Open your terminal or command prompt and install Flask:
    ```bash
    pip install Flask
    ```
4.  **Navigate to Project Directory:** Change your current directory to the `c:\Snake` folder where you saved the files.
    ```bash
    cd c:\Snake
    ```
5.  **Run the Flask Application:** Execute the Python script:
    ```bash
    python app.py
    ```
6.  **Open in Browser:** Open your web browser and go to `http://127.0.0.1:5000/`.

## How to Play

*   Use the **Arrow Keys** (Up, Down, Left, Right) to control the snake's direction.
*   Eat the red food to grow and increase your score.
*   Avoid hitting the walls or the snake's own body.
*   Use the **Pause** and **Restart** buttons during the game as needed.
*   Click the **Start Game** button on the initial screen to begin a new game with your chosen settings.

## Project Structure

```
c:\Snake\
├── app.py              # Flask backend application
├── templates\
│   └── index.html      # Main HTML page
└── static\
    ├── style.css       # Stylesheet
    └── script.js       # Frontend JavaScript logic
```

## Future Improvements

*   Add sound effects and music.
*   Implement a high score system (requires a database).
*   Improve frontend rendering (e.g., smoother movement, better graphics).
*   Add touch controls for mobile devices.
*   Use WebSockets for real-time updates instead of polling.