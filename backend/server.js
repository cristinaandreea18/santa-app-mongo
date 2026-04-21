const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO);
let db, lettersCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('santa_factory');
    lettersCollection = db.collection('letters');
    console.log('Conectat la MongoDB cu driver-ul native');
  } catch (error) {
    console.error('Eroare conectare MongoDB:', error);
  }
}

connectDB();

app.get('/api/letters', async (req, res) => {
  try {
    const letters = await lettersCollection.find().toArray();
    res.json(letters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/letters', async (req, res) => {
  try {
    const letterData = {
      ...req.body,
      receivedDate: new Date(req.body.receivedDate),
    };
    console.log('Date procesate pentru insert:', letterData);

    const result = await lettersCollection.insertOne(letterData);
    const newLetter = await lettersCollection.findOne({
      _id: result.insertedId,
    });
    res.status(201).json(newLetter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/letters/:id', async (req, res) => {
  try {
    console.log('Date primite pentru update:', req.body);
    console.log('ID-ul de actualizat:', req.params.id);

    const processedData = {
      ...req.body,
      receivedDate: new Date(req.body.receivedDate),
    };

    console.log('Date procesate pentru update:', processedData);

    const result = await lettersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: processedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Scrisoare negăsită' });
    }

    const updatedLetter = await lettersCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(updatedLetter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/letters/:id', async (req, res) => {
  try {
    const result = await lettersCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Scrisoare negăsită' });
    }

    res.json({ message: 'Scrisoare ștearsă cu succes' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/elves', async (req, res) => {
  try {
    const elves = await db.collection('elves').find().toArray();
    res.json(elves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/elves', async (req, res) => {
  try {
    const result = await db.collection('elves').insertOne(req.body);
    const newElf = await db
      .collection('elves')
      .findOne({ _id: result.insertedId });
    res.status(201).json(newElf);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/elves/:id', async (req, res) => {
  try {
    const result = await db
      .collection('elves')
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Elf negăsit' });
    }

    const updatedElf = await db.collection('elves').findOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(updatedElf);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/elves/:id', async (req, res) => {
  try {
    const result = await db.collection('elves').deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Elf negăsit' });
    }

    res.json({ message: 'Elf șters cu succes' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gifts', async (req, res) => {
  try {
    const gifts = await db.collection('gifts').find().toArray();
    res.json(gifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gifts', async (req, res) => {
  try {
    console.log('=== DATELE PRIMITE ÎN POST ===');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('letterId value:', req.body.letterId);
    console.log('letterId type:', typeof req.body.letterId);
    console.log('assignedElf value:', req.body.assignedElf);
    console.log('assignedElf type:', typeof req.body.assignedElf);

    const giftData = {
      ...req.body,
      letterId: new ObjectId(req.body.letterId),
      assignedElf: new ObjectId(req.body.assignedElf),
      startDate: new Date(req.body.startDate),
      estimatedCompletion: new Date(req.body.estimatedCompletion),
    };

    console.log('Date procesate pentru insert:', giftData);
    console.log(
      'startDate type după conversie:',
      giftData.startDate instanceof Date
    );
    console.log('startDate value:', giftData.startDate);

    const result = await db.collection('gifts').insertOne(giftData);
    const newGift = await db
      .collection('gifts')
      .findOne({ _id: result.insertedId });
    res.status(201).json(newGift);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/gifts/:id', async (req, res) => {
  try {
    console.log('=== DATELE PRIMITE ÎN POST ===');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('letterId value:', req.body.letterId);
    console.log('letterId type:', typeof req.body.letterId);
    console.log('assignedElf value:', req.body.assignedElf);
    console.log('assignedElf type:', typeof req.body.assignedElf);

    const giftData = {
      ...req.body,
      letterId: new ObjectId(req.body.letterId),
      assignedElf: new ObjectId(req.body.assignedElf),
      startDate: new Date(req.body.startDate),
      estimatedCompletion: new Date(req.body.estimatedCompletion),
    };
    console.log('Date procesate pentru update:', giftData);
    console.log(
      'startDate type după conversie:',
      giftData.startDate instanceof Date
    );
    console.log('startDate value:', giftData.startDate);

    const result = await db
      .collection('gifts')
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: giftData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Cadou negăsit' });
    }

    const updatedGift = await db.collection('gifts').findOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(updatedGift);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/gifts/:id', async (req, res) => {
  try {
    const result = await db.collection('gifts').deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Cadou negăsit' });
    }

    res.json({ message: 'Cadou șters cu succes' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
