CREATE TABLE `playlists` (
	`id` varchar(21) PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `questions` (
	`id` varchar(21),
	`user_id` text NOT NULL,
	`question` text NOT NULL,
	`created_at` timestamp DEFAULT (now())
);

ALTER TABLE questions ADD CONSTRAINT questions_id_playlists_id_fk FOREIGN KEY (`id`) REFERENCES playlists(`id`) ;