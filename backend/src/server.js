require('dotenv').config();
const { app } = require('./app');
const { connectDb } = require('./config/database');

const port = Number(process.env.PORT || 3000);

async function start() {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Server bootstrap failed', error);
    process.exit(1);
  }
}

start();
