import pool from '../src/config/db';

export const resetDatabase = async () => {
  await pool.query('TRUNCATE players, matches RESTART IDENTITY CASCADE');
};

export const closeDatabase = async () => {
  await pool.end();
};
