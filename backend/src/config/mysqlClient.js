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
        // Try to get config from database first
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
                queueLimit: 0
            };
            console.log(`📡 Using MySQL config from DB: ${dbConfig.host}:${dbConfig.port}`);
        } else if (process.env.MYSQL_URL) {
            config = {
                uri: process.env.MYSQL_URL,
                connectionLimit: 10,
                waitForConnections: true,
                queueLimit: 0
            };
            console.log('📡 Using MySQL config from .env');
        } else {
            console.warn('⚠️ No MySQL configuration found (DB or .env)');
            return null;
        }

        pool = mysql.createPool(config);
        console.log('✅ MySQL Pool created');
        return pool;
    } catch (error) {
        console.error('❌ Failed to create MySQL Pool:', error);
        return null;
    }
};

export const testMysqlConnection = async () => {
    try {
        const pool = await getMysqlPool(true); // Always refresh for test
        if (!pool) return { success: false, message: 'MySQL configuration missing' };
        
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return { success: true, message: 'MySQL Connected' };
    } catch (error) {
        console.error('❌ MySQL connection test failed:', error);
        return { success: false, message: error.message };
    }
};

