// src/config/mysqlClient.js
import mysql from 'mysql2/promise';
import { prisma } from './prisma.js';
import dotenv from 'dotenv';

dotenv.config();

let pool;

export const getMysqlPool = async (forceRefresh = false) => {
    if (pool && !forceRefresh) return pool;

    if (pool) {
        await pool.end();
        pool = null;
    }

    try {
        // 1. Try to get config from database first (Highest Priority)
        const dbConfig = await prisma.mysqlConfig.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' }
        });

        let config;
        if (dbConfig) {
            config = {
                host: dbConfig.host,
                port: dbConfig.port,
                user: dbConfig.user,
                password: dbConfig.password,
                database: dbConfig.database,
                connectionLimit: 10,
                waitForConnections: true,
                queueLimit: 0,
                dateStrings: true
            };

        } 
        // 2. Fallback to ENV overrides if DB config fails or is missing
        else if (process.env.MYSQL_HOST) {
            config = {
                host: process.env.MYSQL_HOST,
                port: parseInt(process.env.MYSQL_PORT || 3306),
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE,
                connectionLimit: 10,
                waitForConnections: true,
                queueLimit: 0,
                dateStrings: true
            };
        } else if (process.env.MYSQL_URL) {
            config = {
                uri: process.env.MYSQL_URL,
                connectionLimit: 10,
                waitForConnections: true,
                queueLimit: 0,
                dateStrings: true
            };

        } else {
            console.warn('⚠️ No MySQL configuration found (DB, ENV or MYSQL_URL)');
            return null;
        }

        pool = mysql.createPool(config);
        return pool;
    } catch (error) {
        console.error('❌ Failed to create MySQL Pool:', error);
        return null;
    }
};

export const testMysqlConnection = async () => {
    let currentConfig = null;
    try {
        // 1. Get configuration that would be used
        const dbConfig = await prisma.mysqlConfig.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' }
        });

        if (dbConfig) {
            currentConfig = {
                source: 'database',
                host: dbConfig.host,
                port: dbConfig.port,
                user: dbConfig.user,
                database: dbConfig.database
            };
        } else if (process.env.MYSQL_HOST) {
            currentConfig = {
                source: 'env_vars',
                host: process.env.MYSQL_HOST,
                port: parseInt(process.env.MYSQL_PORT || 3306),
                user: process.env.MYSQL_USER,
                database: process.env.MYSQL_DATABASE
            };
        } else if (process.env.MYSQL_URL) {
            currentConfig = {
                source: 'env_url',
                url: process.env.MYSQL_URL.replace(/:[^@:]*@/, ':****@') // Hide password in logs/response
            };
        }

        const pool = await getMysqlPool(true); // Always refresh for test
        if (!pool) return { 
            success: false, 
            message: 'MySQL configuration missing',
            config: currentConfig 
        };
        
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        
        return { 
            success: true, 
            message: 'MySQL Connected',
            config: currentConfig
        };
    } catch (error) {
        console.error('❌ MySQL connection test failed:', error);
        return { 
            success: false, 
            message: error.message,
            code: error.code,
            errno: error.errno,
            config: currentConfig
        };
    }
};

