import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("API funcionando");
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`escuchando en el puerto: ${PORT}`));