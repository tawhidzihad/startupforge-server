const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT;
const uri = process.env.MONGO_DB_URI;

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		await client.connect();

		/* Database Collections */
		const db = client.db("startupforge");
		const startupsCollection = db.collection("startups");

		/* Create Startups Api For Founder Role */
		app.post("/api/startups", async (req, res) => {
			const startupsData = req.body;
			const newStartupsData = {
				...startupsData,
				createdAt: new Date(),
			};
			const result = await startupsCollection.insertOne(newStartupsData);
			res.json(result);
		});

		/* Get Founder Startup by Founder Email */
		app.get("/api/startups", async (req, res) => {
			const query = {};
			if (req.query.founderEmail) {
				query.founderEmail = req.query.founderEmail;
			}
			const result = await startupsCollection.findOne(query);
			res.json(result);
		});

		/* Update Startup */
		app.patch("/api/startups/:id", async (req, res) => {
			const { id } = req.params;
			const filter = {
				_id: new ObjectId(id),
			};
			const updatedStartupData = {
				$set: req.body,
			};
			const result = await startupsCollection.updateOne(
				filter,
				updatedStartupData,
			);
			res.json(result);
		});

		/* Delete Startup */
		app.delete("/api/startups/:id", async (req, res) => {
			const { id } = req.params;
			const result = await startupsCollection.deleteOne({
				_id: new ObjectId(id),
			});
			res.json(result);
		});
        

		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!",
		);
	} finally {
		// await client.close();
	}
}

run().catch(console.dir);

app.get("/", (req, res) => {
	res.json("StartupForge Server is Running!");
});

app.listen(port, () => {
	console.log(`StartupForge app listening on port ${port}`);
});
