from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

# Game settings options
GRID_SIZES = [10, 20, 30] # Small, Medium, Large
DIFFICULTY_LEVELS = {
    'easy': 300,  # Slower speed (milliseconds)
    'medium': 200, # Medium speed
    'hard': 100    # Faster speed
}
CELL_SIZE = 13 # Size in pixels for frontend rendering (kept constant for simplicity)

# Speed increment settings (lower value means faster game)
SPEED_DECREMENT_PER_FOOD = 5 # Decrease game_speed by 5ms per food
MIN_GAME_SPEED = 50 # Minimum speed (fastest the game can get)

# Game state
game_state = {
    'snake': [],
    'food': {},
    'direction': 'right',
    'score': 0,
    'game_over': False,
    'grid_size': GRID_SIZES[1], # Default to medium
    'game_speed': DIFFICULTY_LEVELS['medium'] # Default to medium
}

def reset_game(grid_size, difficulty):
    """Resets the game state with chosen settings."""
    global game_state
    game_state['grid_size'] = grid_size
    # Set initial speed based on difficulty
    game_state['game_speed'] = DIFFICULTY_LEVELS.get(difficulty, DIFFICULTY_LEVELS['medium']) # Default if invalid difficulty

    # Initial snake position based on new grid size
    initial_x = grid_size // 2
    initial_y = grid_size // 2

    game_state['snake'] = [{'x': initial_x, 'y': initial_y}]
    game_state['direction'] = 'right'
    game_state['score'] = 0
    game_state['game_over'] = False
    game_state['food'] = generate_food() # Generate food based on new grid size

def generate_food():
    """Generates random food coordinates not on the snake within the current grid size."""
    current_grid_size = game_state['grid_size']
    while True:
        food_pos = {'x': random.randint(0, current_grid_size - 1), 'y': random.randint(0, current_grid_size - 1)}
        if food_pos not in game_state['snake']:
            return food_pos

def update_game_state():
    """Updates the game state based on the current direction."""
    if game_state['game_over']:
        return

    snake = game_state['snake']
    direction = game_state['direction']
    head = snake[0]
    current_grid_size = game_state['grid_size']

    # Calculate new head position
    new_head = {'x': head['x'], 'y': head['y']}
    if direction == 'up':
        new_head['y'] -= 1
    elif direction == 'down':
        new_head['y'] += 1
    elif direction == 'left':
        new_head['x'] -= 1
    elif direction == 'right':
        new_head['x'] += 1

    # Check for collisions
    # Wall collision
    if (new_head['x'] < 0 or new_head['x'] >= current_grid_size or
        new_head['y'] < 0 or new_head['y'] >= current_grid_size):
        game_state['game_over'] = True
        return

    # Self collision
    if new_head in snake:
        game_state['game_over'] = True
        return

    # Add new head
    snake.insert(0, new_head)

    # Check if food is eaten
    if new_head == game_state['food']:
        game_state['score'] += 1
        game_state['food'] = generate_food()
        # Increase speed gradually
        game_state['game_speed'] = max(MIN_GAME_SPEED, game_state['game_speed'] - SPEED_DECREMENT_PER_FOOD)
    else:
        # Remove tail if food not eaten
        snake.pop()

@app.route('/')
def index():
    """Serves the main game page with options."""
    return render_template('index.html',
                           grid_sizes=GRID_SIZES,
                           difficulties=DIFFICULTY_LEVELS.keys(),
                           cell_size=CELL_SIZE) # Pass cell_size for frontend canvas calculation

@app.route('/game_state')
def get_game_state():
    """Returns the current game state as JSON."""
    # Update state before sending (this makes the snake move automatically)
    # A more robust approach for real-time would use websockets, but this is simpler.
    # The frontend will poll this endpoint.
    update_game_state()
    return jsonify(game_state)

@app.route('/move', methods=['POST'])
def move_snake():
    """Receives direction input from the frontend."""
    if game_state['game_over']:
        return jsonify({'status': 'game over'})

    data = request.json
    new_direction = data.get('direction')

    # Prevent reversing direction immediately
    if new_direction == 'up' and game_state['direction'] != 'down':
        game_state['direction'] = new_direction
    elif new_direction == 'down' and game_state['direction'] != 'up':
        game_state['direction'] = new_direction
    elif new_direction == 'left' and game_state['direction'] != 'right':
        game_state['direction'] = new_direction
    elif new_direction == 'right' and game_state['direction'] != 'left':
        game_state['direction'] = new_direction

    return jsonify({'status': 'ok'})

@app.route('/start_game', methods=['POST'])
def start_game_endpoint():
    """Starts a new game with selected settings."""
    data = request.json
    grid_size = int(data.get('grid_size', GRID_SIZES[1])) # Default to medium
    difficulty = data.get('difficulty', 'medium') # Default to medium

    # Validate grid size
    if grid_size not in GRID_SIZES:
         grid_size = GRID_SIZES[1] # Fallback to default

    reset_game(grid_size, difficulty)
    return jsonify({'status': 'ok', 'initial_state': game_state}) # Return initial state

if __name__ == '__main__':
    # Initial setup (will be overwritten by /start_game)
    reset_game(GRID_SIZES[1], 'medium')
    app.run(debug=True)
