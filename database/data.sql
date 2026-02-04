INSERT INTO users (username, password, email) VALUES 
('admin', '$2b$10$0SmAG1Krhjiz9ptsXgJXDOmJ.O1I.ProyYSKHXM7sJXBpvEnsdL0K', 'admin@gmail.com');

INSERT INTO images (width, height, filepath) VALUES 
(800, 600, 'uploads/cover_images/1.png');

INSERT INTO game_maps (creator_id, title, cover_image_id ) VALUES 
(1, "testgame", 1);
