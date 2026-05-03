CREATE DATABASE IF NOT EXISTS lokea
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

USE lokea;

CREATE TABLE images (
    image_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    filepath VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) BINARY NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    role VARCHAR(5) DEFAULT 'user',
    pfp INT DEFAULT NULL,
    language VARCHAR(5) DEFAULT 'hu',
    darkmode BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (pfp) REFERENCES images(image_id) ON DELETE SET NULL
);

CREATE TABLE admin_settings (
    settings_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    admin_id INT UNIQUE,
    darkmode BOOLEAN DEFAULT 0,
    selected_chart VARCHAR(20) DEFAULT 'activity-week',
    foreign key (admin_id) references users(user_id) ON DELETE CASCADE
);

CREATE TABLE game_maps (
    game_maps_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    creator_id INT,
    title VARCHAR(50) NOT NULL DEFAULT 'Névtelen pálya',
    cover_image_id INT,
    game_description VARCHAR(255) NOT NULL DEFAULT 'Nem található leírás',
    game_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (cover_image_id) REFERENCES images(image_id) ON DELETE SET NULL
);

CREATE TABLE game_maps_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    game_maps_id INT NOT NULL,
    user_id INT,
    comment_text VARCHAR(255) DEFAULT NULL,
    rating INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_maps_id) REFERENCES game_maps(game_maps_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT unique_comment_per_user_per_map UNIQUE (game_maps_id, user_id),
    CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5)
);

CREATE TABLE map (
    map_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    title VARCHAR(20) NOT NULL,
    game_maps_id INT NOT NULL,
    image_id INT,
    FOREIGN KEY (game_maps_id) REFERENCES game_maps(game_maps_id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES images(image_id) ON DELETE CASCADE
);

CREATE TABLE points (
    point_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    map_id INT NOT NULL,
    point_u FLOAT NOT NULL,
    point_v FLOAT NOT NULL,
    north_direction DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    image_id INT,
    FOREIGN KEY (map_id) REFERENCES map(map_id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES images(image_id) ON DELETE SET NULL,
    UNIQUE KEY unique_point_coordinates_per_map (map_id, point_u, point_v),
    CONSTRAINT check_point_u_range CHECK (point_u >= 0 AND point_u < 1),
    CONSTRAINT check_point_v_range CHECK (point_v >= 0 AND point_v < 1),
    CONSTRAINT check_north_direction CHECK (north_direction >= 0 AND north_direction < 360)
);

CREATE TABLE favorites (
    user_id INT NOT NULL,
    game_maps_id INT NOT NULL,
    PRIMARY KEY (user_id, game_maps_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_maps_id) REFERENCES game_maps(game_maps_id) ON DELETE CASCADE
);

CREATE TABLE log (
    log_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    user_id INT NOT NULL,
    victim_id INT DEFAULT NULL,
    activity VARCHAR(50),
    happened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (victim_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE point_connections (
    connection_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    start_point_id INT NOT NULL,
    end_point_id INT NOT NULL,
    game_maps_id INT NOT NULL,

    direction_start_to_end DECIMAL(5,2) DEFAULT NULL,
    direction_end_to_start DECIMAL(5,2) DEFAULT NULL,

    FOREIGN KEY (start_point_id) REFERENCES points(point_id) ON DELETE CASCADE,
    FOREIGN KEY (end_point_id) REFERENCES points(point_id) ON DELETE CASCADE,
    FOREIGN KEY (game_maps_id) REFERENCES game_maps(game_maps_id) ON DELETE CASCADE,

    CONSTRAINT check_different_points CHECK (start_point_id != end_point_id),
    CONSTRAINT unique_connection UNIQUE (game_maps_id, start_point_id, end_point_id),
    CONSTRAINT check_point_order CHECK (start_point_id < end_point_id),

    CONSTRAINT check_direction_s2e CHECK (direction_start_to_end >= 0 AND direction_start_to_end < 360),
    CONSTRAINT check_direction_e2s CHECK (direction_end_to_start >= 0 AND direction_end_to_start < 360)
);

CREATE TABLE game_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    game_maps_id INT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    current_cycle INT NOT NULL DEFAULT 1,
    current_round INT NOT NULL DEFAULT 0,
    rounds INT NOT NULL DEFAULT 5,
    sharpness FLOAT NOT NULL DEFAULT -3,
    time_per_round INT NOT NULL DEFAULT 30,
    current_point_id INT NULL,
    FOREIGN KEY (current_point_id) REFERENCES points(point_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (game_maps_id) REFERENCES game_maps(game_maps_id) ON DELETE CASCADE
);

CREATE TABLE session_guesses (
    guess_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    point_id INT,
    round INT NOT NULL,
    map_id INT,
    guessed_u FLOAT NOT NULL,
    guessed_v FLOAT NOT NULL,
    points_awarded INT NOT NULL,
    guessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cycle INT NOT NULL,
    FOREIGN KEY (map_id) REFERENCES map(map_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (point_id) REFERENCES points(point_id) ON DELETE SET NULL
);

SET GLOBAL event_scheduler = ON;

CREATE EVENT expire_abandoned_sessions
ON SCHEDULE EVERY 1 HOUR
DO
    UPDATE game_sessions
    SET finished_at = CURRENT_TIMESTAMP
    WHERE finished_at IS NULL
      AND COALESCE(
          (SELECT MAX(guessed_at) FROM session_guesses WHERE session_guesses.session_id = game_sessions.session_id),
          started_at
      ) < DATE_SUB(NOW(), INTERVAL 2 HOUR);


