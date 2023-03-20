CREATE TABLE `playlists` (
	`id` varchar(21) PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);

CREATE TABLE `questions` (
	`id` varchar(21) NOT NULL,
	`question` text NOT NULL
);

ALTER TABLE questions ADD CONSTRAINT questions_id_playlists_id_fk FOREIGN KEY (`id`) REFERENCES playlists(`id`) ;