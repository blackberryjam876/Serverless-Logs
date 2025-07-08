import snowflake from 'snowflake-sdk';

const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USER,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
});

export default function handler(req, res) {
  const query = req.query.q || '';
  connection.connect((err) => {
    if (err) {
      res.status(500).json({ error: 'Connection failed' });
      return;
    }
    const sql = `SELECT * FROM LOGS WHERE message LIKE '%${query}%' ORDER BY timestamp DESC LIMIT 100`;
    connection.execute({
      sqlText: sql,
      complete: (err, stmt, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json(rows);
        }
      }
    });
  });
}
