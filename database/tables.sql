CREATE DATABASE IF NOT EXISTS bigprojekt_db
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

CREATE TABLE users (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    role VARCHAR(5) DEFAULT 'user',
    2fa BOOLEAN DEFAULT 0,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pictures {
    picid int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    width int NOT NULL,
    height int NOT NULL,
    filepath varchar(255) NOT NULL
};

CREATE TABLE map {
    mapid int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    creatorid int,
    name varchar(50) NOT NULL,
    picid int,
    foreign key (creatorid) references users(userid) ON DELETE SET NULL,
    foreign key (picid) references pictures(picid) ON DELETE SET NULL
};

CREATE TABLE points {
    pointid int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    mapid int,
    pointx int NOT NULL,
    pointy int NOT NULL,
    picid int,
    foreign key (mapid) references map(mapid) ON DELETE SET NULL,
    foreign key (picid) references pictures(picid) ON DELETE SET NULL
};