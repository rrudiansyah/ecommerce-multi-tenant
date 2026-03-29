CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`ip_address` varchar(45),
	`user_agent` text,
	`is_active` boolean DEFAULT true,
	`last_activity` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`role` enum('superadmin','tenant_admin','customer') NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`phone` varchar(100) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`status` enum('pending','active','rejected','suspended') DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;