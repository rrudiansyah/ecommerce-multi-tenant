CREATE TABLE `tenants` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`business_type` enum('coffee_shop','fashion','laundry','restoran','bakery') NOT NULL,
	`domain` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_domain_unique` UNIQUE(`domain`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;