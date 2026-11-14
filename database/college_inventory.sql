
-- ==========================================
-- COLLEGE INVENTORY MANAGEMENT SYSTEM
-- DATABASE CREATION
-- ==========================================

CREATE DATABASE IF NOT EXISTS college_inventory_db;

USE college_inventory_db;


-- ==========================================
-- 1. USERS TABLE
-- Stores Admin, Faculty and Student details
-- ==========================================

CREATE TABLE IF NOT EXISTS Users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'faculty', 'student') NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active'
);


-- ==========================================
-- 2. ITEMS TABLE
-- Stores inventory item details
-- ==========================================

CREATE TABLE IF NOT EXISTS Items (
    itemId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    availableQuantity INT NOT NULL DEFAULT 0,
    purchaseDate DATE,
    itemCondition VARCHAR(100),
    threshold INT NOT NULL DEFAULT 5,
    status ENUM('active', 'inactive') DEFAULT 'active'
);


-- ==========================================
-- 3. ISSUE RECORDS TABLE
-- Tracks item issue and return details
-- ==========================================

CREATE TABLE IF NOT EXISTS IssueRecords (
    issueId INT AUTO_INCREMENT PRIMARY KEY,
    itemId INT NOT NULL,
    issuedTo INT NOT NULL,
    issuedBy INT NOT NULL,
    issueDate DATE NOT NULL,
    returnDate DATE DEFAULT NULL,
    status ENUM('issued', 'returned') DEFAULT 'issued',

    FOREIGN KEY (itemId) REFERENCES Items(itemId),
    FOREIGN KEY (issuedTo) REFERENCES Users(userId),
    FOREIGN KEY (issuedBy) REFERENCES Users(userId)
);


-- ==========================================
-- 4. REPORTS TABLE
-- Stores inventory report summaries
-- ==========================================

CREATE TABLE IF NOT EXISTS Reports (
    reportId INT AUTO_INCREMENT PRIMARY KEY,
    totalItems INT DEFAULT 0,
    totalIssued INT DEFAULT 0,
    totalReturned INT DEFAULT 0,
    lowStockCount INT DEFAULT 0,
    generatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- END OF DATABASE SCRIPT
-- ==========================================
