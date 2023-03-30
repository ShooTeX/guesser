CREATE TABLE `playlists` (
	`id` varchar(21) PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()));

CREATE TABLE `answers` (
	`id` varchar(21) PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`answer` text NOT NULL,
	`correct` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`question_id` varchar(21) NOT NULL);

CREATE TABLE `questions` (
	`id` varchar(21) PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question` text NOT NULL,
	`playlist_id` varchar(21) NOT NULL,
	`order` smallint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()));

CREATE INDEX question_id_idx ON answers (`question_id`);
CREATE INDEX playlist_id_idx ON questions (`playlist_id`);
CREATE UNIQUE INDEX order_idx ON questions (`order`,`playlist_id`);