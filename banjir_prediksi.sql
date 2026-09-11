-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Waktu pembuatan: 30 Agu 2026 pada 16.59
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `banjir_prediksi`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_config`
--

CREATE TABLE `tb_config` (
  `id` int(11) NOT NULL,
  `config_key` varchar(50) DEFAULT NULL,
  `config_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tb_config`
--

INSERT INTO `tb_config` (`id`, `config_key`, `config_value`, `updated_at`) VALUES
(1, 'refresh_interval', '5000', '2026-04-25 13:46:47'),
(2, 'alert_threshold_aman', '40', '2026-04-25 13:46:47'),
(3, 'alert_threshold_bahaya', '60', '2026-04-25 13:46:47');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_fuzzy_log`
--

CREATE TABLE `tb_fuzzy_log` (
  `id` int(11) NOT NULL,
  `curah_hujan` float DEFAULT NULL,
  `durasi_hujan` int(11) DEFAULT NULL,
  `intensitas_hujan` float DEFAULT NULL,
  `derajat_rendah` float DEFAULT NULL,
  `derajat_sedang` float DEFAULT NULL,
  `derajat_tinggi` float DEFAULT NULL,
  `durasi_singkat` float DEFAULT NULL,
  `durasi_sedang` float DEFAULT NULL,
  `durasi_lama` float DEFAULT NULL,
  `intensitas_rendah` float DEFAULT NULL,
  `intensitas_sedang` float DEFAULT NULL,
  `intensitas_tinggi` float DEFAULT NULL,
  `output_fuzzy` float DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_sensor`
--

CREATE TABLE `tb_sensor` (
  `id` int(11) NOT NULL,
  `curah_hujan` float NOT NULL,
  `durasi_hujan` int(11) NOT NULL,
  `intensitas_hujan` float NOT NULL,
  `potensi_banjir` float DEFAULT NULL,
  `status_banjir` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `kategori_hujan` varchar(20) DEFAULT NULL,
  `kejadian_hari` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `v_rekap_harian`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `v_rekap_harian` (
`tanggal` date
,`jumlah_data` bigint(21)
,`total_curah` double(18,1)
,`rata_curah` double(18,1)
,`skor_tertinggi` float
,`skor_terendah` float
,`skor_rata_rata` double(18,1)
,`status_tertinggi` varchar(9)
);

-- --------------------------------------------------------

--
-- Struktur untuk view `v_rekap_harian`
--
DROP VIEW IF EXISTS `v_rekap_harian`;
DROP TABLE IF EXISTS `v_rekap_harian`;

CREATE VIEW `v_rekap_harian` AS SELECT cast(`tb_sensor`.`created_at` as date) AS `tanggal`, count(0) AS `jumlah_data`, round(sum(`tb_sensor`.`curah_hujan`),1) AS `total_curah`, round(avg(`tb_sensor`.`curah_hujan`),1) AS `rata_curah`, max(`tb_sensor`.`potensi_banjir`) AS `skor_tertinggi`, min(`tb_sensor`.`potensi_banjir`) AS `skor_terendah`, round(avg(`tb_sensor`.`potensi_banjir`),1) AS `skor_rata_rata`, CASE WHEN max(case when `tb_sensor`.`status_banjir` like '%BAHAYA%' then 3 when `tb_sensor`.`status_banjir` like '%WASPADA%' then 2 when `tb_sensor`.`status_banjir` like '%AMAN%' then 1 else 0 end) = 3 THEN '🔴 BAHAYA' WHEN max(case when `tb_sensor`.`status_banjir` like '%BAHAYA%' then 3 when `tb_sensor`.`status_banjir` like '%WASPADA%' then 2 when `tb_sensor`.`status_banjir` like '%AMAN%' then 1 else 0 end) = 2 THEN '🟡 WASPADA' WHEN max(case when `tb_sensor`.`status_banjir` like '%BAHAYA%' then 3 when `tb_sensor`.`status_banjir` like '%WASPADA%' then 2 when `tb_sensor`.`status_banjir` like '%AMAN%' then 1 else 0 end) = 1 THEN '🟢 AMAN' ELSE '🟢 AMAN' END AS `status_tertinggi` FROM `tb_sensor` WHERE `tb_sensor`.`curah_hujan` > 0 GROUP BY cast(`tb_sensor`.`created_at` as date) ORDER BY cast(`tb_sensor`.`created_at` as date) DESC ;


--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `tb_config`
--
ALTER TABLE `tb_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `config_key` (`config_key`);

--
-- Indeks untuk tabel `tb_fuzzy_log`
--
ALTER TABLE `tb_fuzzy_log`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `tb_sensor`
--
ALTER TABLE `tb_sensor`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `tb_config`
--
ALTER TABLE `tb_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `tb_fuzzy_log`
--
ALTER TABLE `tb_fuzzy_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `tb_sensor`
--
ALTER TABLE `tb_sensor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
