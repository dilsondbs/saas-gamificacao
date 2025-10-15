-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: saas_gamificacao_central
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `course_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('lesson','quiz','assignment','video','reading') NOT NULL DEFAULT 'lesson',
  `points_value` int(11) NOT NULL DEFAULT 10,
  `order` int(11) NOT NULL DEFAULT 0,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`content`)),
  `duration_minutes` int(11) NOT NULL DEFAULT 0,
  `is_required` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activities_course_id_order_index` (`course_id`,`order`),
  CONSTRAINT `activities_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` VALUES (1,1,'Instalação do Laravel','Descrição da atividade: Instalação do Laravel','lesson',10,1,NULL,0,1,1,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(2,1,'Primeira Rota','Descrição da atividade: Primeira Rota','lesson',15,2,NULL,0,1,1,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(3,1,'Quiz: Rotas Laravel','Descrição da atividade: Quiz: Rotas Laravel','quiz',20,3,NULL,0,1,1,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(4,1,'Criando Controllers','Descrição da atividade: Criando Controllers','lesson',15,4,NULL,0,1,1,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(5,1,'Trabalho Final','Descrição da atividade: Trabalho Final','assignment',50,5,NULL,0,1,1,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(6,2,'O que é React?','Descrição da atividade: O que é React?','video',10,1,NULL,0,1,1,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(7,2,'Componentes Funcionais','Descrição da atividade: Componentes Funcionais','lesson',15,2,NULL,0,1,1,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(8,2,'Quiz: Hooks React','Descrição da atividade: Quiz: Hooks React','quiz',25,3,NULL,0,1,1,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(9,2,'Projeto Prático','Descrição da atividade: Projeto Prático','assignment',40,4,NULL,0,1,1,'2025-09-08 19:14:46','2025-09-08 19:14:46');
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `badges`
--

DROP TABLE IF EXISTS `badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `badges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#3B82F6',
  `type` enum('completion','points','streak','special') NOT NULL DEFAULT 'completion',
  `criteria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`criteria`)),
  `points_value` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `badges`
--

LOCK TABLES `badges` WRITE;
/*!40000 ALTER TABLE `badges` DISABLE KEYS */;
INSERT INTO `badges` VALUES (1,'Primeiro Passo','Complete sua primeira atividade',NULL,'#10B981','completion','{\"activities_completed\":1}',10,1,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(2,'Estudante Dedicado','Complete 5 atividades',NULL,'#3B82F6','completion','{\"activities_completed\":5}',25,1,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(3,'Colecionador de Pontos','Acumule 100 pontos',NULL,'#F59E0B','points','{\"total_points\":100}',20,1,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(4,'Mestre dos Cursos','Complete um curso inteiro',NULL,'#8B5CF6','completion','{\"courses_completed\":1}',50,1,'2025-09-08 19:14:46','2025-09-08 19:14:46');
/*!40000 ALTER TABLE `badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_enrollments`
--

DROP TABLE IF EXISTS `course_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course_enrollments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `course_id` bigint(20) unsigned NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `progress_percentage` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_enrollments_user_id_course_id_unique` (`user_id`,`course_id`),
  KEY `course_enrollments_course_id_foreign` (`course_id`),
  CONSTRAINT `course_enrollments_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_enrollments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_enrollments`
--

LOCK TABLES `course_enrollments` WRITE;
/*!40000 ALTER TABLE `course_enrollments` DISABLE KEYS */;
INSERT INTO `course_enrollments` VALUES (1,4,1,'2025-08-22 19:14:46','2025-08-30 19:14:46',52,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(2,5,1,'2025-08-17 19:14:46','2025-08-26 19:14:46',16,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(3,5,2,'2025-08-25 19:14:46',NULL,28,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(4,6,1,'2025-09-06 19:14:46','2025-09-01 19:14:46',94,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(5,7,1,'2025-08-15 19:14:46','2025-09-01 19:14:46',88,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(6,7,2,'2025-08-19 19:14:46','2025-09-07 19:14:46',29,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(7,8,1,'2025-08-16 19:14:46',NULL,70,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(8,8,2,'2025-08-24 19:14:46',NULL,33,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(9,9,1,'2025-08-22 19:14:46','2025-08-31 19:14:46',74,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(10,9,2,'2025-08-22 19:14:46',NULL,18,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(11,10,1,'2025-08-29 19:14:46',NULL,28,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(12,11,1,'2025-08-30 19:14:46','2025-09-03 19:14:46',93,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(13,12,1,'2025-08-13 19:14:46','2025-09-06 19:14:46',92,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(14,12,2,'2025-08-24 19:14:46',NULL,76,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(15,13,1,'2025-08-26 19:14:46',NULL,41,'2025-09-08 19:14:46','2025-09-08 19:14:46');
/*!40000 ALTER TABLE `course_enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_materials`
--

DROP TABLE IF EXISTS `course_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course_materials` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `course_id` bigint(20) unsigned NOT NULL,
  `instructor_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(255) NOT NULL,
  `file_size` int(11) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `file_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`file_metadata`)),
  `suggested_structure` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`suggested_structure`)),
  `is_processed` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `course_materials_course_id_foreign` (`course_id`),
  KEY `course_materials_instructor_id_foreign` (`instructor_id`),
  CONSTRAINT `course_materials_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_materials_instructor_id_foreign` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_materials`
--

LOCK TABLES `course_materials` WRITE;
/*!40000 ALTER TABLE `course_materials` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `points_per_completion` int(11) NOT NULL DEFAULT 100,
  `instructor_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courses_instructor_id_foreign` (`instructor_id`),
  CONSTRAINT `courses_instructor_id_foreign` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'Introdução ao Laravel','Aprenda os conceitos básicos do framework Laravel',NULL,'published',200,2,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(2,'React para Iniciantes','Domine os fundamentos da biblioteca React',NULL,'published',150,3,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(3,'JavaScript Avançado','Conceitos avançados de JavaScript moderno',NULL,'published',250,2,'2025-09-08 19:14:46','2025-09-08 19:14:46');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `domains`
--

DROP TABLE IF EXISTS `domains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `domains` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `domain` varchar(255) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `domains_domain_unique` (`domain`),
  KEY `domains_tenant_id_foreign` (`tenant_id`),
  CONSTRAINT `domains_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `domains`
--

LOCK TABLES `domains` WRITE;
/*!40000 ALTER TABLE `domains` DISABLE KEYS */;
INSERT INTO `domains` VALUES (1,'vemcomigoja.saas-gamificacao.local','fa74b446-697f-478f-8c0c-5fbd48bc258e','2025-09-11 12:13:45','2025-09-11 12:13:45'),(2,'saasgamificao.saas-gamificacao.local','4cbc2482-563a-4b6b-a69e-98fd5117d344','2025-09-11 21:24:49','2025-09-11 21:24:49');
/*!40000 ALTER TABLE `domains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2014_10_12_000000_create_users_table',1),(2,'2014_10_12_100000_create_password_resets_table',1),(3,'2019_08_19_000000_create_failed_jobs_table',1),(4,'2019_09_15_000010_create_tenants_table',1),(5,'2019_09_15_000020_create_domains_table',1),(6,'2019_12_14_000001_create_personal_access_tokens_table',1),(7,'2020_05_15_000010_create_tenant_user_impersonation_tokens_table',1),(8,'2025_08_19_214609_add_role_to_users_table',1),(9,'2025_08_19_214616_create_courses_table',1),(10,'2025_08_19_214622_create_course_enrollments_table',1),(11,'2025_08_19_214629_create_badges_table',1),(12,'2025_08_19_214637_create_user_badges_table',1),(13,'2025_08_19_214649_create_points_table',1),(14,'2025_08_19_214656_create_activities_table',1),(15,'2025_08_19_214703_create_user_activities_table',1),(16,'2025_08_20_233927_create_sessions_table',1),(17,'2025_08_23_181029_add_duration_and_active_to_activities_table',1),(18,'2025_08_26_120727_create_course_materials_table',1),(19,'2025_08_28_001239_fix_tenants_table_structure',1),(20,'2025_09_09_140843_create_plan_prices_table',2),(21,'2025_09_09_145240_create_tenant_contracts_table',3),(22,'2025_09_10_112514_create_tenant_activities_table',4);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_prices`
--

DROP TABLE IF EXISTS `plan_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plan_prices` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(255) NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_prices_plan_name_unique` (`plan_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_prices`
--

LOCK TABLES `plan_prices` WRITE;
/*!40000 ALTER TABLE `plan_prices` DISABLE KEYS */;
INSERT INTO `plan_prices` VALUES (1,'teste',0.00,'2025-09-09 17:11:21','2025-09-09 18:45:43'),(2,'basic',19.90,'2025-09-09 17:11:21','2025-09-10 14:42:51'),(3,'premium',49.90,'2025-09-09 17:11:21','2025-09-10 14:42:51'),(4,'enterprise',199.00,'2025-09-09 17:11:21','2025-09-10 14:42:51');
/*!40000 ALTER TABLE `plan_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `points`
--

DROP TABLE IF EXISTS `points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `points` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `points` int(11) NOT NULL,
  `type` enum('earned','spent','bonus','penalty') NOT NULL DEFAULT 'earned',
  `source_type` varchar(255) NOT NULL,
  `source_id` bigint(20) unsigned NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `points_user_id_created_at_index` (`user_id`,`created_at`),
  KEY `points_source_type_source_id_index` (`source_type`,`source_id`),
  CONSTRAINT `points_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `points`
--

LOCK TABLES `points` WRITE;
/*!40000 ALTER TABLE `points` DISABLE KEYS */;
INSERT INTO `points` VALUES (1,4,43,'earned','App\\Models\\Activity',8,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(2,4,35,'earned','App\\Models\\Activity',2,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(3,4,16,'earned','App\\Models\\Activity',9,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(4,4,37,'earned','App\\Models\\Activity',3,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(5,4,40,'earned','App\\Models\\Activity',6,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(6,4,35,'earned','App\\Models\\Activity',1,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(7,4,19,'earned','App\\Models\\Activity',4,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(8,5,44,'earned','App\\Models\\Activity',7,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(9,5,30,'earned','App\\Models\\Activity',9,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(10,5,47,'earned','App\\Models\\Activity',1,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(11,5,9,'earned','App\\Models\\Activity',4,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(12,5,28,'earned','App\\Models\\Activity',8,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(13,5,19,'earned','App\\Models\\Activity',3,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(14,5,27,'earned','App\\Models\\Activity',5,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(15,6,28,'earned','App\\Models\\Activity',7,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(16,6,36,'earned','App\\Models\\Activity',8,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(17,6,37,'earned','App\\Models\\Activity',7,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(18,7,44,'earned','App\\Models\\Activity',1,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(19,7,24,'earned','App\\Models\\Activity',5,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(20,7,33,'earned','App\\Models\\Activity',5,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(21,8,5,'earned','App\\Models\\Activity',9,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(22,8,44,'earned','App\\Models\\Activity',9,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(23,8,30,'earned','App\\Models\\Activity',5,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(24,8,39,'earned','App\\Models\\Activity',1,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(25,8,24,'earned','App\\Models\\Activity',4,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(26,8,13,'earned','App\\Models\\Activity',1,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(27,8,30,'earned','App\\Models\\Activity',9,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(28,8,38,'earned','App\\Models\\Activity',6,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(29,9,33,'earned','App\\Models\\Activity',7,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(30,9,17,'earned','App\\Models\\Activity',5,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(31,9,50,'earned','App\\Models\\Activity',4,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(32,10,14,'earned','App\\Models\\Activity',1,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(33,10,28,'earned','App\\Models\\Activity',8,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(34,10,43,'earned','App\\Models\\Activity',2,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(35,10,40,'earned','App\\Models\\Activity',8,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(36,10,16,'earned','App\\Models\\Activity',8,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(37,10,47,'earned','App\\Models\\Activity',4,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(38,10,10,'earned','App\\Models\\Activity',2,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(39,10,45,'earned','App\\Models\\Activity',4,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(40,11,25,'earned','App\\Models\\Activity',4,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(41,11,45,'earned','App\\Models\\Activity',5,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(42,11,11,'earned','App\\Models\\Activity',9,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(43,11,30,'earned','App\\Models\\Activity',6,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(44,11,5,'earned','App\\Models\\Activity',5,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(45,12,40,'earned','App\\Models\\Activity',4,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(46,12,16,'earned','App\\Models\\Activity',7,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(47,12,11,'earned','App\\Models\\Activity',7,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(48,12,19,'earned','App\\Models\\Activity',7,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(49,12,48,'earned','App\\Models\\Activity',5,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(50,12,34,'earned','App\\Models\\Activity',2,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(51,12,42,'earned','App\\Models\\Activity',6,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(52,12,6,'earned','App\\Models\\Activity',3,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(53,13,49,'earned','App\\Models\\Activity',5,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(54,13,11,'earned','App\\Models\\Activity',6,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(55,13,5,'earned','App\\Models\\Activity',1,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(56,13,10,'earned','App\\Models\\Activity',6,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(57,13,45,'earned','App\\Models\\Activity',5,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(58,13,31,'earned','App\\Models\\Activity',5,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46'),(59,13,31,'earned','App\\Models\\Activity',6,'Pontos por completar atividade','2025-09-08 19:14:46','2025-09-08 19:14:46');
/*!40000 ALTER TABLE `points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_activities`
--

DROP TABLE IF EXISTS `tenant_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenant_activities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(255) NOT NULL,
  `tenant_name` varchar(255) NOT NULL,
  `activity_type` varchar(255) NOT NULL,
  `plan_name` varchar(255) NOT NULL,
  `monthly_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `financial_impact` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `occurred_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `performed_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_activities_tenant_id_activity_type_index` (`tenant_id`,`activity_type`),
  KEY `tenant_activities_activity_type_occurred_at_index` (`activity_type`,`occurred_at`),
  KEY `tenant_activities_occurred_at_index` (`occurred_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_activities`
--

LOCK TABLES `tenant_activities` WRITE;
/*!40000 ALTER TABLE `tenant_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_contracts`
--

DROP TABLE IF EXISTS `tenant_contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenant_contracts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(255) NOT NULL,
  `plan_name` varchar(255) NOT NULL,
  `contracted_price` decimal(8,2) NOT NULL,
  `contract_start` date NOT NULL,
  `contract_end` date NOT NULL,
  `status` enum('active','cancelled','suspended','pending') NOT NULL DEFAULT 'active',
  `billing_cycle` enum('monthly','yearly') NOT NULL DEFAULT 'monthly',
  `discount_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_contracts_tenant_id_status_index` (`tenant_id`,`status`),
  KEY `tenant_contracts_contract_end_index` (`contract_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_contracts`
--

LOCK TABLES `tenant_contracts` WRITE;
/*!40000 ALTER TABLE `tenant_contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_user_impersonation_tokens`
--

DROP TABLE IF EXISTS `tenant_user_impersonation_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenant_user_impersonation_tokens` (
  `token` varchar(128) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `auth_guard` varchar(255) NOT NULL,
  `redirect_url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`token`),
  KEY `tenant_user_impersonation_tokens_tenant_id_foreign` (`tenant_id`),
  CONSTRAINT `tenant_user_impersonation_tokens_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_user_impersonation_tokens`
--

LOCK TABLES `tenant_user_impersonation_tokens` WRITE;
/*!40000 ALTER TABLE `tenant_user_impersonation_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_user_impersonation_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenants` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `plan` varchar(255) NOT NULL DEFAULT 'basic',
  `max_users` int(11) NOT NULL DEFAULT 10,
  `max_courses` int(11) NOT NULL DEFAULT 5,
  `max_storage_mb` bigint(20) NOT NULL DEFAULT 100,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `subscription_ends_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenants_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('4cbc2482-563a-4b6b-a69e-98fd5117d344','SaaS Gamificação','saasgamificao','SaaS Gamificação','premium',200,50,10240,1,NULL,NULL,'2025-09-11 21:24:48','2025-09-11 21:24:48','{\"settings\":\"{\\\"primary_color\\\":\\\"#3B82F6\\\",\\\"logo_url\\\":null,\\\"industry\\\":\\\"Educa\\\\u00e7\\\\u00e3o Superior\\\",\\\"expected_users\\\":\\\"100\\\"}\",\"tenancy_db_name\":\"tenant4cbc2482-563a-4b6b-a69e-98fd5117d344\"}'),('fa74b446-697f-478f-8c0c-5fbd48bc258e','VemComigoJa','vemcomigoja','VemComigoJa','premium',200,50,10240,1,NULL,NULL,'2025-09-11 12:13:42','2025-09-11 12:13:42','{\"settings\":\"{\\\"primary_color\\\":\\\"#3bf7ea\\\",\\\"logo_url\\\":null,\\\"industry\\\":\\\"Educa\\\\u00e7\\\\u00e3o Superior\\\",\\\"expected_users\\\":\\\"100\\\"}\",\"tenancy_db_name\":\"tenantfa74b446-697f-478f-8c0c-5fbd48bc258e\"}');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_activities`
--

DROP TABLE IF EXISTS `user_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_activities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `activity_id` bigint(20) unsigned NOT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_activities_user_id_activity_id_unique` (`user_id`,`activity_id`),
  KEY `user_activities_activity_id_foreign` (`activity_id`),
  KEY `user_activities_user_id_completed_at_index` (`user_id`,`completed_at`),
  CONSTRAINT `user_activities_activity_id_foreign` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_activities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activities`
--

LOCK TABLES `user_activities` WRITE;
/*!40000 ALTER TABLE `user_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_badges`
--

DROP TABLE IF EXISTS `user_badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_badges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `badge_id` bigint(20) unsigned NOT NULL,
  `earned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_badges_user_id_badge_id_unique` (`user_id`,`badge_id`),
  KEY `user_badges_badge_id_foreign` (`badge_id`),
  CONSTRAINT `user_badges_badge_id_foreign` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_badges_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_badges`
--

LOCK TABLES `user_badges` WRITE;
/*!40000 ALTER TABLE `user_badges` DISABLE KEYS */;
INSERT INTO `user_badges` VALUES (1,5,4,'2025-09-07 19:14:46',NULL,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(2,6,3,'2025-08-26 19:14:46',NULL,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(3,7,4,'2025-09-01 19:14:46',NULL,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(4,11,1,'2025-09-04 19:14:46',NULL,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(5,12,3,'2025-08-26 19:14:46',NULL,'2025-09-08 19:14:46','2025-09-08 19:14:46');
/*!40000 ALTER TABLE `user_badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('admin','instructor','student') NOT NULL DEFAULT 'student',
  `total_points` int(11) NOT NULL DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@saas-gamificacao.com','admin',0,'2025-09-08 19:14:45','$2y$10$3iBNzOp1ERvkPUICBndp1eJYC5VW.VfmOUDNwWzFmNJ7.2vfpLQPK',NULL,'2025-09-08 19:14:45','2025-09-08 19:14:45'),(2,'Professor João Silva','joao@saas-gamificacao.com','instructor',0,'2025-09-08 19:14:45','$2y$10$LtsL58NamSmuGWE0gne3b.u3PiDnmZK0nIfJ4gE8buWVeF3ctvJ1i',NULL,'2025-09-08 19:14:45','2025-09-08 19:14:45'),(3,'Professora Maria Santos','maria@saas-gamificacao.com','instructor',0,'2025-09-08 19:14:45','$2y$10$G0LhYsH3UD3FrJ5OJptLyOBgS5KYUsZSa/WX38ShcQXKlS0uHqjT2',NULL,'2025-09-08 19:14:45','2025-09-08 19:14:45'),(4,'Aluno 1','aluno1@saas-gamificacao.com','student',225,'2025-09-08 19:14:45','$2y$10$NWgnOUZGILutu60Uvq37AuwWlcVeS7MN487B31bVf5.4D5dfUW6Oq',NULL,'2025-09-08 19:14:45','2025-09-08 19:14:46'),(5,'Aluno 2','aluno2@saas-gamificacao.com','student',204,'2025-09-08 19:14:45','$2y$10$E7ldENP4buxhZ3mFL2cstu45P.dh3U8OZKKhqjYJ9REBe78xnGVTu',NULL,'2025-09-08 19:14:45','2025-09-08 19:14:46'),(6,'Aluno 3','aluno3@saas-gamificacao.com','student',101,'2025-09-08 19:14:45','$2y$10$BhoE70VjNUt3bcTsx/ArrO6KzDxFLDShSDvvN2tiSfbW8TfJOz9h.',NULL,'2025-09-08 19:14:45','2025-09-08 19:14:46'),(7,'Aluno 4','aluno4@saas-gamificacao.com','student',101,'2025-09-08 19:14:45','$2y$10$R9CHVxgM7BIwelnoTTlVvOsFnuFCSBc5f8FP8D3mTUYJq9gnazhnK',NULL,'2025-09-08 19:14:45','2025-09-08 19:14:46'),(8,'Aluno 5','aluno5@saas-gamificacao.com','student',223,'2025-09-08 19:14:45','$2y$10$qXA7DlwG5cRFob4/NTAccerxvOGo.Z5klcGGVdpY0m7rWZ211HxhS',NULL,'2025-09-08 19:14:45','2025-09-08 19:14:46'),(9,'Aluno 6','aluno6@saas-gamificacao.com','student',100,'2025-09-08 19:14:45','$2y$10$EEQP9T8ksDHvzNrPJll9uemzcwxSBQtquAdisakkqdNHI3PpHsrGm',NULL,'2025-09-08 19:14:45','2025-09-08 19:14:46'),(10,'Aluno 7','aluno7@saas-gamificacao.com','student',243,'2025-09-08 19:14:45','$2y$10$GEmImkIR5SqvPagcaYdDxu7OHn0DVZnGk9//qzsv6rtDx7ULp3K.6',NULL,'2025-09-08 19:14:45','2025-09-08 19:14:46'),(11,'Aluno 8','aluno8@saas-gamificacao.com','student',116,'2025-09-08 19:14:45','$2y$10$GzMQuvDWiIl5i6QSuNv8sem0Yae/lx1YDRWJIYSd9ZL7s5T45MVAy',NULL,'2025-09-08 19:14:45','2025-09-08 19:14:46'),(12,'Aluno 9','aluno9@saas-gamificacao.com','student',216,'2025-09-08 19:14:45','$2y$10$dNUeefMd5d6vxUtr7mtMAOdU35NKFPtZ07Z5mG.J5VXMdlyJNYgGa',NULL,'2025-09-08 19:14:45','2025-09-08 19:14:46'),(13,'Aluno 10','aluno10@saas-gamificacao.com','student',182,'2025-09-08 19:14:45','$2y$10$8LbdTPpdDYydLffzlkjJA.Wo1.Ujvgc2KtQqO2hmNmpGkZtzRYvVu',NULL,'2025-09-08 19:14:46','2025-09-08 19:14:46'),(14,'Super Admin','super@saas-gamificacao.com','admin',0,NULL,'$2y$10$GKALkLuR1Kr3blPPjTa06umYLIJfRgNjEwGFXdu.FUSkqav0EXDqy',NULL,'2025-09-10 13:18:16','2025-09-10 13:18:16');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-12 12:08:13
