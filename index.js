const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost/drugstore", { useNewUrlParser: true });

const Drug = mongoose.model("Drug", {
  name: {
    type: String,
    default: ""
  },
  quantity: {
    type: Number,
    default: 0,
    min: [0, "Plus assez en stock"] // On defini la valeur minimal et on met un message d'erreur par default
  }
});

const drugstore = [];

// Route pour creer un medoc
app.post("/drug", async (req, res) => {
  const name = req.body.name;
  const quantity = Number(req.body.quantity);

  // On checher un drug dans la base de donnee qui a comme nom `name`
  const ifExist = await Drug.findOne({ name: name });
  // Si on en trouve un ERROR
  if (ifExist !== null) {
    return res.status(400).send({
      error: {
        message: "Drug already exists"
      }
    });
  }

  // On genere le nouveau medoc
  try {
    // On cree un nouveau medoc avec le Model
    const newDrug = Drug({
      name: name,
      quantity: quantity
    });

    // On sauvegarde le nouveau medoc pour l'ajouter a la base de donnee
    await newDrug.save();
    res.status(201).send(newDrug);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Route pour lister les medocs
app.get("/drug", async (req, res) => {
  try {
    const drugs = await Drug.find();
    res.json(drugs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour lister les medocs
app.get("/drug/:id/quantity", async (req, res) => {
  const id = req.params.id;
  try {
    // On cherche UN et Unique medoc qui a comme _id `id`
    const drug = await Drug.findOne({ _id: id });
    res.send({ quantity: drug.quantity });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Route pour ajouter des medocs
app.put("/drug/add", async (req, res) => {
  const name = req.body.name;
  const quantity = Number(req.body.quantity);

  try {
    // On checher un drug dans la base de donnee qui a comme nom `name`
    const drug = await Drug.findOne({ name: name });
    // Si on en trouve un ERROR
    drug.quantity += quantity;
    await drug.save();
    res.status(201).send(drug);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Route pour renomer un medoc
app.put("/drug/rename", async (req, res) => {
  const id = req.body.id;
  const name = req.body.name;

  try {
    // On checher un drug dans la base de donnee qui a comme nom `name`
    const drug = await Drug.findOne({ _id: id });
    // Si on en trouve un ERROR
    drug.name = name;
    await drug.save();
    res.status(201).send(drug);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.put("/drug/remove", async (req, res) => {
  const name = req.body.name;
  const quantity = Number(req.body.quantity);

  try {
    // On checher un drug dans la base de donnee qui a comme nom `name`
    const drug = await Drug.findOne({ name: name });
    // Si on en trouve un ERROR
    drug.quantity -= quantity;
    await drug.save();
    res.status(201).send(drug);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.delete("/drug", async (req, res) => {
  const id = req.body.id;
  try {
    // On supprime le medoc qui a pour id `id`
    await Drug.findByIdAndRemove(id);
    res.send("Ok");
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server started");
});
