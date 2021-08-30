/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`storage` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `storage`;

/*Table structure for table `cluster` */

DROP TABLE IF EXISTS `cluster`;

CREATE TABLE `cluster` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `primary_address` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_storage_cluster_natural_key` (`primary_address`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

/*Data for the table `cluster` */

insert  into `cluster`(`id`,`name`,`primary_address`) values (1,'cluster1','cluster1');
insert  into `cluster`(`id`,`name`,`primary_address`) values (2,'cluster2','cluster2');

/*Table structure for table `svm` */

DROP TABLE IF EXISTS `svm`;

CREATE TABLE `svm` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cluster_id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `type` varchar(255) NOT NULL COMMENT 'possible values are admin,node,cluster,data',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_storage_svm_natural_key` (`cluster_id`,`name`),
  CONSTRAINT `fk_storage_svm_cluster_id` FOREIGN KEY (`cluster_id`) REFERENCES `cluster` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=323833 DEFAULT CHARSET=utf8;

/*Data for the table `svm` */

insert  into `svm`(`id`,`cluster_id`,`name`,`type`) values (1,1,'svm1','data'),(2,1,'svm2','data'),(3,2,'svm3','data'),(4,2,'svm4','data');

/*Table structure for table `volume` */

DROP TABLE IF EXISTS `volume`;

CREATE TABLE `volume` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `svm_id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_storage_volume_natural_key` (`name`,`svm_id`),
  KEY `fk_storage_volume_svm_id` (`svm_id`),
  CONSTRAINT `fk_storage_volume_svm_id` FOREIGN KEY (`svm_id`) REFERENCES `svm` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=331761 DEFAULT CHARSET=utf8;

/*Data for the table `volume` */

insert  into `volume`(`id`,`svm_id`,`name`) values (1,1,'vol1'),(2,1,'vol2'),(3,2,'vol3'),(4,2,'vol4'),(5,3,'vol5'),(6,3,'vol6'),(7,4,'vol7'),(8,4,'vol8');


/*Create views for number generation*/
CREATE OR REPLACE VIEW storage.generator_16
AS SELECT 0 n UNION ALL SELECT 1  UNION ALL SELECT 2  UNION ALL
   SELECT 3   UNION ALL SELECT 4  UNION ALL SELECT 5  UNION ALL
   SELECT 6   UNION ALL SELECT 7  UNION ALL SELECT 8  UNION ALL
   SELECT 9   UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL
   SELECT 12  UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL
   SELECT 15;

CREATE OR REPLACE VIEW storage.generator_256
AS SELECT ( ( hi.n << 4 ) | lo.n ) AS n
     FROM storage.generator_16 lo, storage.generator_16 hi;

CREATE OR REPLACE VIEW storage.generator_4k
AS SELECT ( ( hi.n << 8 ) | lo.n ) AS n
     FROM storage.generator_256 lo, storage.generator_16 hi;

CREATE OR REPLACE VIEW storage.generator_64k
AS SELECT ( ( hi.n << 8 ) | lo.n ) AS n
     FROM storage.generator_256 lo, storage.generator_256 hi;

CREATE OR REPLACE VIEW storage.generator_1m
AS SELECT ( ( hi.n << 16 ) | lo.n ) AS n
     FROM storage.generator_64k lo, storage.generator_16 hi;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
