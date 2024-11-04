import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());
const PORT = 3000;
const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

app.get('/', (req, res) => {
    console.log(req.cookies);
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, () => {
    console.log("Server is running on http://localhost:${PORT}");
});
