CREATE DATABASE IF NOT EXISTS bigprojekt_db
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

USE bigprojekt_db;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    role VARCHAR(5) DEFAULT 'user',
    pfp VARCHAR(30) DEFAULT 'default.png',
    is_2fa BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE images (
    image_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    width int NOT NULL,
    height int NOT NULL,
    filepath varchar(255) NOT NULL
);

CREATE TABLE game_maps (
    game_maps_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    creator_id int,
    title varchar(50) NOT NULL,
    cover_image_id int,
    rating float DEFAULT 0,
    rating_count int DEFAULT 0,
    plays int DEFAULT 0,
    game_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foreign key (creator_id) references users(user_id) ON DELETE SET NULL,
    foreign key (cover_image_id) references images(image_id) ON DELETE SET NULL
);

CREATE TABLE map (
    map_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
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
    image_id int,
    foreign key (map_id) references map(map_id) ON DELETE SET NULL,
    foreign key (image_id) references images(image_id) ON DELETE SET NULL
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


