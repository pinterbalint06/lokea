CREATE DATABASE IF NOT EXISTS bigprojekt_db
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

USE bigprojekt_db;

CREATE TABLE images (
    image_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    width int NOT NULL,
    height int NOT NULL,
    filepath varchar(255) NOT NULL
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE BINARY,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    role VARCHAR(5) DEFAULT 'user',
    pfp INT DEFAULT NULL,
    is_2fa BOOLEAN DEFAULT 0,
    language VARCHAR(5) DEFAULT 'hu',
    darkmode BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    foreign key (pfp) references images(image_id) ON DELETE SET NULL
);

CREATE TABLE admin_settings (
    settings_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    admin_id INT UNIQUE,
    darkmode BOOLEAN DEFAULT 0,
    selected_chart VARCHAR(20) DEFAULT 'Heti aktivitás',
    foreign key (admin_id) references users(user_id) ON DELETE CASCADE
)

CREATE TABLE game_maps (
    game_maps_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    creator_id int,
    title varchar(50) NOT NULL DEFAULT 'Névtelen pálya',
    cover_image_id int,
    game_description varchar(255) NOT NULL DEFAULT 'Nem található leírás',
    game_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foreign key (creator_id) references users(user_id) ON DELETE SET NULL,
    foreign key (cover_image_id) references images(image_id) ON DELETE SET NULL
);

CREATE TABLE game_maps_comments (
    comment_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    game_maps_id int,
    user_id int,
    comment_text varchar(255) DEFAULT NULL,
    rating int NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foreign key (game_maps_id) references game_maps(game_maps_id) ON DELETE CASCADE,
    foreign key (user_id) references users(user_id) ON DELETE SET NULL,
    CONSTRAINT unique_comment_per_user_per_map UNIQUE (game_maps_id, user_id),
    CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5)
);

CREATE TABLE map (
    map_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    title varchar(20) NOT NULL,
    game_maps_id int,
    image_id int,
    foreign key (game_maps_id) references game_maps(game_maps_id) ON DELETE CASCADE,
    foreign key (image_id) references images(image_id) ON DELETE CASCADE
);

CREATE TABLE points (
    point_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    map_id int,
    point_u float NOT NULL,
    point_v float NOT NULL,
    north_direction DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    image_id int,
    foreign key (map_id) references map(map_id) ON DELETE CASCADE,
    foreign key (image_id) references images(image_id) ON DELETE SET NULL,
    UNIQUE KEY unique_point_coordinates_per_map (map_id, point_u, point_v),
    CONSTRAINT check_point_u_range CHECK (point_u >= 0 AND point_u < 1),
    CONSTRAINT check_point_v_range CHECK (point_v >= 0 AND point_v < 1),
    CONSTRAINT check_north_direction CHECK (north_direction >= 0 AND north_direction < 360)
);

CREATE TABLE scores (
    score_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    user_id int,
    game_maps_id int,
    score int NOT NULL,
    score_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foreign key (user_id) references users(user_id) ON DELETE set NULL,
    foreign key (game_maps_id) references game_maps(game_maps_id) ON DELETE CASCADE
);

CREATE TABLE favorites (
    favorite_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    user_id int,
    game_maps_id int,
    foreign key (user_id) references users(user_id) ON DELETE CASCADE,
    foreign key (game_maps_id) references game_maps(game_maps_id) ON DELETE CASCADE
);

CREATE TABLE log (
    log_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    user_id INT,
    victim_id INT DEFAULT NULL,
    activity VARCHAR(50),
    happened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foreign key (user_id) references users(user_id) ON DELETE CASCADE
);

CREATE TABLE point_connections (
    connection_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    start_point_id int NOT NULL,
    end_point_id int NOT NULL,
    game_maps_id int NOT NULL,

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
