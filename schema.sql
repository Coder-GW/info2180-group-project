-- to install this database, from a terminal, type:
-- mysql -u USERNAME -p -h SERVERNAME dolphin_crm < schema.sql
--
-- Host: localhost    Database: dolphin_crm
-- ------------------------------------------------------

DROP DATABASE IF EXISTS dolphin_crm;
CREATE DATABASE dolphin_crm;
USE dolphin_crm;

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `firstname` VARCHAR(40) NOT NULL,
  `lastname` VARCHAR(40) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seeded admin account: password is hashed outside of this SQL file.

INSERT INTO users (firstname, lastname, email, password, role)
VALUES ('Admin', 'User', 'admin@project2.com', '$2y$10$.QO6LSt4jO/oBzqNL04Akeu9pFe/I/P8Orx26TtXc3LEXxo9VTg6i', 'admin');

CREATE TABLE `contacts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(10) NOT NULL,
  `firstname` VARCHAR(40) NOT NULL,
  `lastname` VARCHAR(40) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `telephone` VARCHAR(20) NOT NULL,
  `company` VARCHAR(100) DEFAULT NULL,
  `type` VARCHAR(10) NOT NULL,
  `assigned_to` INT UNSIGNED DEFAULT NULL,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `notes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `contact_id` INT UNSIGNED NOT NULL,
  `comment` VARCHAR(1023) NOT NULL,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- End of schema.sql