const express = require('express');
const path = require('path');

const app = express();

// Serve static files correctly
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all to serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
