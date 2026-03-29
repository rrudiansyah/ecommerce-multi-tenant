ALTER TABLE `sessions` MODIFY COLUMN `user_id` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `tenant_id` bigint unsigned;