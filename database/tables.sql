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
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    role VARCHAR(5) DEFAULT 'user',
    pfp INT DEFAULT NULL,
    is_2fa BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    foreign key (pfp) references images(image_id) ON DELETE SET NULL
);

CREATE TABLE game_maps (
    game_maps_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    creator_id int,
    title varchar(50) NOT NULL,
    cover_image_id int,
    rating float DEFAULT 0,
    rating_count int DEFAULT 0,
    plays int DEFAULT 0,
    game_description varchar(255) DEFAULT 'Nem található leírás',
    game_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foreign key (creator_id) references users(user_id) ON DELETE SET NULL,
    foreign key (cover_image_id) references images(image_id) ON DELETE SET NULL
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
    point_x int NOT NULL,
    point_y int NOT NULL,
    north_direction int NOT NULL DEFAULT 0,
    image_id int,
    foreign key (map_id) references map(map_id) ON DELETE SET NULL,
    foreign key (image_id) references images(image_id) ON DELETE SET NULL,
    CONSTRAINT check_north_direction CHECK (north_direction >= 0 AND north_direction <= 359)
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
    user_id int,
    activity varchar(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foreign key (user_id) references users(user_id) ON DELETE CASCADE
);

-- TODO: trigger start_point_id mindig kisebb legyen?
CREATE TABLE point_connections (
    connection_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    start_point_id int NOT NULL,
    end_point_id int NOT NULL,
    game_maps_id int NOT NULL,
    FOREIGN KEY (start_point_id) REFERENCES points(point_id) ON DELETE CASCADE,
    FOREIGN KEY (end_point_id) REFERENCES points(point_id) ON DELETE CASCADE,
    FOREIGN KEY (game_maps_id) REFERENCES game_maps(game_maps_id) ON DELETE CASCADE,
    CONSTRAINT check_different_points CHECK (start_point_id != end_point_id),
    CONSTRAINT unique_connection UNIQUE (game_maps_id, start_point_id, end_point_id)
);
