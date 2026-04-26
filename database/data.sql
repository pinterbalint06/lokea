INSERT INTO users (username, password, email) VALUES 
('admin', '$2b$10$0SmAG1Krhjiz9ptsXgJXDOmJ.O1I.ProyYSKHXM7sJXBpvEnsdL0K', 'admin@gmail.com');

INSERT INTO images (width, height, filepath) VALUES 
(800, 600, 'cover_images/1.jpg');

INSERT INTO game_maps (creator_id, title, cover_image_id ) VALUES 
(1, "testgame", 1);
INSERT INTO game_maps (creator_id, title, cover_image_id, rating) VALUES 
(1, "testgame", 1, 5.8);
INSERT INTO game_maps (creator_id, title, cover_image_id, rating) VALUES 
(1, "testgame", 1, 2);

INSERT INTO map (title, game_maps_id, image_id) VALUES 
('testmap', 1, 1);

INSERT INTO images (width, height, filepath) VALUES 
(2048, 1024, 'maps/testmap1.webp'),
(640, 320, 'maps/testmap2.webp'),
(1024, 512, 'points/testpoint1.webp'),
(1024, 512, 'points/testpoint2.webp'),
(1024, 512, 'points/testpoint3.webp');

INSERT INTO points (map_id, point_u, point_v, north_direction, image_id) VALUES
(1, 0.0586, 0.1367, 0, 2),
(1, 0.2051, 0.1758, 90, 3),
(1, 0.1221, 0.3418, 180, 4);
