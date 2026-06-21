import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_X7ZPdz0nkjUm@ep-tiny-bush-ahmf9y7d-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

try {
  const spaceCols = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'Space' AND table_schema = 'public' 
    ORDER BY ordinal_position
  `);
  console.log('Space columns:', spaceCols.rows.map(x => x.column_name));

  const userCols = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'User' AND table_schema = 'public' 
    ORDER BY ordinal_position
  `);
  console.log('User columns:', userCols.rows.map(x => x.column_name));

  const tables = await pool.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  console.log('Tables:', tables.rows.map(x => x.table_name));
} catch (e) {
  console.error(e);
} finally {
  await pool.end();
}
