CREATE TABLE `playlists` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);

CREATE TABLE `questions` (
	`id` varchar(21) PRIMARY KEY NOT NULL,
	`question` text NOT NULL
);
