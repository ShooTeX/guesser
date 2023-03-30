CREATE TABLE `answers` (
	`id` varchar(21) PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`answer` text NOT NULL,
	`correct` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`question_id` varchar(21) NOT NULL);

ALTER TABLE questions MODIFY COLUMN `id` varchar(21) NOT NULL;
ALTER TABLE `questions` ADD PRIMARY KEY (`id`);
ALTER TABLE questions MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());
ALTER TABLE questions ADD `playlist_id` varchar(21) NOT NULL;
ALTER TABLE questions ADD `order` smallint NOT NULL;
ALTER TABLE questions ADD CONSTRAINT questions_playlist_id_playlists_id_fk FOREIGN KEY (`playlist_id`) REFERENCES playlists(`id`) ON DELETE cascade ;
ALTER TABLE questions DROP FOREIGN KEY questions_id_playlists_id_fk;

ALTER TABLE answers ADD CONSTRAINT answers_question_id_questions_id_fk FOREIGN KEY (`question_id`) REFERENCES questions(`id`) ON DELETE cascade ;
CREATE UNIQUE INDEX order_idx ON questions (`order`,`playlist_id`);