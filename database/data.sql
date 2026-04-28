USE bigprojekt_db;

-- Users
INSERT INTO users (username, password, email) VALUES
('admin', '$2b$10$0SmAG1Krhjiz9ptsXgJXDOmJ.O1I.ProyYSKHXM7sJXBpvEnsdL0K', 'admin@gmail.com');
-- user_id = 1

-- Cover image
INSERT INTO images (width, height, filepath) VALUES
(800, 600, 'cover_images/1.jpg');
-- image_id = 1

-- Game map
INSERT INTO game_maps (creator_id, title, cover_image_id) VALUES
(1, 'testgame', 1);
-- game_maps_id = 1

-- Map images
INSERT INTO images (width, height, filepath) VALUES
(2048, 1024, 'maps/testmap1.webp'),
(640,  320,  'maps/testmap2.webp');
-- image_id = 2, 3

-- Maps
INSERT INTO map (title, game_maps_id, image_id) VALUES
('testmap1', 1, 2),
('testmap2', 1, 3);
-- map_id = 1, 2

-- Point panorama images
INSERT INTO images (width, height, filepath) VALUES
(1024, 512, 'points/testpoint1.webp'),
(1024, 512, 'points/testpoint2.webp'),
(1024, 512, 'points/testpoint3.webp');
-- image_id = 4, 5, 6

-- Points (all on map 1)
INSERT INTO points (map_id, point_u, point_v, north_direction, image_id) VALUES
(1, 0.0586, 0.1367,   0, 4),
(1, 0.2051, 0.1758,  90, 5),
(1, 0.1221, 0.3418, 180, 6);
-- point_id = 1, 2, 3

-- Rating via comment (game_maps has no rating column)
INSERT INTO game_maps_comments (game_maps_id, user_id, comment_text, rating) VALUES
(1, 1, 'Remek tesztpálya!', 5);

-- Finished game session (plays count is based on finished sessions)
INSERT INTO game_sessions (user_id, game_maps_id, rounds, sharpness, time_per_round, current_round, finished_at) VALUES
(1, 1, 3, -3, 30, 3, CURRENT_TIMESTAMP);
-- session_id = 1

-- Guesses for that session (scoreboard is based on SUM(points_awarded))
INSERT INTO session_guesses (session_id, point_id, round, map_id, guessed_u, guessed_v, distance_error, points_awarded, cycle) VALUES
(1, 1, 1, 1, 0.0600, 0.1400, 0.0025, 4800, 1),
(1, 2, 2, 1, 0.2000, 0.1800, 0.0065, 4200, 1),
(1, 3, 3, 1, 0.1300, 0.3500, 0.0095, 3900, 1);
-- total score = 12900
