CREATE DATABASE  IF NOT EXISTS `restaurante` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `restaurante`;
-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: restaurante
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bebida`
--

DROP TABLE IF EXISTS `bebida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bebida` (
  `nome_bebida` varchar(100) NOT NULL,
  `ingredientes` varchar(100) DEFAULT NULL,
  `valor_bebida` int DEFAULT NULL,
  `status_bebida` enum('preparando','pronto') DEFAULT NULL,
  PRIMARY KEY (`nome_bebida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bebida`
--

LOCK TABLES `bebida` WRITE;
/*!40000 ALTER TABLE `bebida` DISABLE KEYS */;
INSERT INTO `bebida` VALUES ('Caipirinha','Cachaça, limão, açúcar, gelo',13,'pronto'),('Cosmopolitan','Vodka, licor de laranja, suco de cranberry, suco de limão, gelo',13,'pronto'),('Margarita','Tequila, licor de laranja, suco de limão, sal',12,'pronto'),('Mojito','Rum, hortelã, limão, açúcar, água com gás, gelo',11,'pronto'),('Piña Colada','Rum, leite de coco, suco de abacaxi, açúcar, gelo',14,'pronto'),('Sex on the Beach','Vodka, licor de pêssego, suco de laranja, suco de cranberry, gelo',15,'pronto');
/*!40000 ALTER TABLE `bebida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cardapio`
--

DROP TABLE IF EXISTS `cardapio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cardapio` (
  `id_cardapio` int NOT NULL AUTO_INCREMENT,
  `numero_pedido` int DEFAULT NULL,
  `quantidade` int DEFAULT NULL,
  `valor` decimal(10,2) DEFAULT NULL,
  `nome_comida` varchar(100) DEFAULT NULL,
  `nome_bebida` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_cardapio`),
  KEY `fk_nome_comida` (`nome_comida`),
  KEY `fk_nome_bebida` (`nome_bebida`),
  CONSTRAINT `fk_nome_bebida` FOREIGN KEY (`nome_bebida`) REFERENCES `bebida` (`nome_bebida`),
  CONSTRAINT `fk_nome_comida` FOREIGN KEY (`nome_comida`) REFERENCES `comida` (`nome_comida`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cardapio`
--

LOCK TABLES `cardapio` WRITE;
/*!40000 ALTER TABLE `cardapio` DISABLE KEYS */;
INSERT INTO `cardapio` VALUES (1,NULL,25,16.00,'Frango Grelhado',NULL),(2,NULL,25,20.00,'Hambúrguer Clássico',NULL),(3,NULL,25,23.00,'Lasanha Bolonhesa',NULL),(4,NULL,25,26.00,'Pizza Margherita',NULL),(5,NULL,25,13.00,'Salada Caesar',NULL),(6,NULL,25,30.00,'Sushi Misto',NULL),(8,NULL,30,13.00,NULL,'Caipirinha'),(9,NULL,30,13.00,NULL,'Cosmopolitan'),(10,NULL,30,12.00,NULL,'Margarita'),(11,NULL,30,11.00,NULL,'Mojito'),(12,NULL,30,14.00,NULL,'Piña Colada'),(13,NULL,30,15.00,NULL,'Sex on the Beach');
/*!40000 ALTER TABLE `cardapio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `cpf_cliente` varchar(14) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `tef` varchar(15) DEFAULT NULL,
  `senha` varchar(100) NOT NULL,
  PRIMARY KEY (`cpf_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES ('12345678900','visitante',NULL,NULL,'nova_senha');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comanda`
--

DROP TABLE IF EXISTS `comanda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comanda` (
  `numero_comanda` int NOT NULL,
  `numero_mesa` int DEFAULT NULL,
  `cpf_cliente` varchar(14) DEFAULT NULL,
  `pagamento` enum('pendente','fechamento') DEFAULT 'pendente',
  `valor` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`numero_comanda`),
  KEY `cpf_cliente` (`cpf_cliente`),
  KEY `fk_numero_mesa` (`numero_mesa`),
  KEY `fk_valor_mesa` (`valor`),
  CONSTRAINT `comanda_ibfk_1` FOREIGN KEY (`cpf_cliente`) REFERENCES `clientes` (`cpf_cliente`),
  CONSTRAINT `fk_numero_mesa` FOREIGN KEY (`numero_mesa`) REFERENCES `mesa` (`numero_mesa`),
  CONSTRAINT `fk_valor_mesa` FOREIGN KEY (`valor`) REFERENCES `mesa` (`valor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comanda`
--

LOCK TABLES `comanda` WRITE;
/*!40000 ALTER TABLE `comanda` DISABLE KEYS */;
/*!40000 ALTER TABLE `comanda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comida`
--

DROP TABLE IF EXISTS `comida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comida` (
  `nome_comida` varchar(100) NOT NULL,
  `ingredientes` varchar(100) DEFAULT NULL,
  `valor_comida` int DEFAULT NULL,
  `status_comida` enum('preparando','pronto') DEFAULT NULL,
  PRIMARY KEY (`nome_comida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comida`
--

LOCK TABLES `comida` WRITE;
/*!40000 ALTER TABLE `comida` DISABLE KEYS */;
INSERT INTO `comida` VALUES ('Frango Grelhado','Peito de frango grelhado, arroz, feijão, salada',16,'pronto'),('Hambúrguer Clássico','Pão, hambúrguer de carne, queijo, alface, tomate, maionese',20,'preparando'),('Lasanha Bolonhesa','Massa, molho bolonhesa, queijo, presunto',23,'preparando'),('Pizza Margherita','Molho de tomate, queijo muçarela, manjericão fresco',26,'pronto'),('Salada Caesar','Alface romana, croutons, queijo parmesão, molho Caesar',13,'pronto'),('Sushi Misto','Salmão, atum, camarão, arroz, alga marinha',30,'pronto');
/*!40000 ALTER TABLE `comida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesa`
--

DROP TABLE IF EXISTS `mesa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mesa` (
  `numero_mesa` int NOT NULL,
  `numero_comanda` int DEFAULT NULL,
  `quantidade` int DEFAULT NULL,
  `valor` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`numero_mesa`),
  KEY `numero_comanda` (`numero_comanda`),
  KEY `fk_quantidade_pedido` (`quantidade`),
  KEY `fk_valor_pedido_nova` (`valor`),
  CONSTRAINT `fk_quantidade_pedido` FOREIGN KEY (`quantidade`) REFERENCES `pedido` (`quantidade`),
  CONSTRAINT `fk_valor_pedido_nova` FOREIGN KEY (`valor`) REFERENCES `pedido` (`valor_pedido`),
  CONSTRAINT `mesa_ibfk_1` FOREIGN KEY (`numero_comanda`) REFERENCES `comanda` (`numero_comanda`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesa`
--

LOCK TABLES `mesa` WRITE;
/*!40000 ALTER TABLE `mesa` DISABLE KEYS */;
/*!40000 ALTER TABLE `mesa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido`
--

DROP TABLE IF EXISTS `pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido` (
  `numero_pedido` int NOT NULL,
  `quantidade` int DEFAULT NULL,
  `numero_mesa` int DEFAULT NULL,
  `valor_pedido` decimal(10,2) DEFAULT NULL,
  `status_pedido` enum('preparando','pronto') DEFAULT NULL,
  `id_cardapio` int DEFAULT NULL,
  `quantidade_cardapio` int DEFAULT NULL,
  PRIMARY KEY (`numero_pedido`),
  KEY `numero_mesa` (`numero_mesa`),
  KEY `idx_quantidade` (`quantidade`),
  KEY `fk_valor_pedido` (`valor_pedido`),
  KEY `fk_status_pedido` (`status_pedido`),
  KEY `fk_id_cardapio` (`id_cardapio`),
  CONSTRAINT `fk_id_cardapio` FOREIGN KEY (`id_cardapio`) REFERENCES `cardapio` (`id_cardapio`),
  CONSTRAINT `fk_status_pedido` FOREIGN KEY (`status_pedido`) REFERENCES `status` (`status_pedido`),
  CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`numero_mesa`) REFERENCES `mesa` (`numero_mesa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido`
--

LOCK TABLES `pedido` WRITE;
/*!40000 ALTER TABLE `pedido` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status` (
  `numero_pedido` int NOT NULL,
  `status_pedido` enum('preparando','pronto') DEFAULT NULL,
  PRIMARY KEY (`numero_pedido`),
  KEY `idx_status_pedido` (`status_pedido`),
  CONSTRAINT `status_ibfk_1` FOREIGN KEY (`numero_pedido`) REFERENCES `pedido` (`numero_pedido`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status`
--

LOCK TABLES `status` WRITE;
/*!40000 ALTER TABLE `status` DISABLE KEYS */;
/*!40000 ALTER TABLE `status` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-20  8:16:34
