const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  process.stdout.write(JSON.stringify({ message: `Server running on port ${PORT}` }) + "\n");
});
