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
		const opportunitiesCollection = db.collection("opportunities");

		/* Create Startups Api, For Founder Role */
		app.post("/api/startups", async (req, res) => {
			const startupsData = req.body;
			const newStartupsData = {
				...startupsData,
				createdAt: new Date(),
			};
			const result = await startupsCollection.insertOne(newStartupsData);
			res.json(result);
		});

		/* Get Founder Startup by Founder Email, For Founder Role */
		app.get("/api/startups", async (req, res) => {
			const query = {};
			if (req.query.founderEmail) {
				query.founderEmail = req.query.founderEmail;
			}
			const result = await startupsCollection.findOne(query);
			res.json(result);
		});

		/* Update Startup, For Founder Role*/
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

		/* Delete Startup, For Founder Role */
		app.delete("/api/startups/:id", async (req, res) => {
			const { id } = req.params;
			const result = await startupsCollection.deleteOne({
				_id: new ObjectId(id),
			});
			res.json(result);
		});

		/*=================================================*/
		/* Create Opportunity By Founder, For Founder Role*/
		app.post("/api/opportunities", async (req, res) => {
			const opportunityData = req.body;
			const newOpportunityData = {
				...opportunityData,
				createdAt: new Date(),
			};
			const result =
				await opportunitiesCollection.insertOne(newOpportunityData);
			res.json(result);
		});

		/* Get Opportunities by FounderId, For Founder Role */
		app.get("/api/opportunities", async (req, res) => {
			const query = {};
			if (req.query.founderId) {
				query.founderId = req.query.founderId;
			}
			const cursor = opportunitiesCollection.find(query);
			const result = await cursor.toArray();
			res.json(result);
		});

		/* Update Opportunities Data by founder, For Founder Role */
		app.patch("/api/opportunities/:id", async (req, res) => {
			const { id } = req.params;
			const filter = {
				_id: new ObjectId(id),
			};
			const updatedOpportunitiesData = {
				$set: req.body,
			};
			const result = await opportunitiesCollection.updateOne(
				filter,
				updatedOpportunitiesData,
			);
			res.json(result);
		});

		/* Delete opportunity by founder, For Founder Role  */
		app.delete("/api/opportunities/:id", async (req, res) => {
			const { id } = req.params;
			const result = await opportunitiesCollection.deleteOne({
				_id: new ObjectId(id),
			});
			res.json(result);
		});

		/* =======================Public Routes========================== */
		/* Get Startup For All Public by Search Query - For Browse Startup Route  */
		app.get("/api/public/startups", async (req, res) => {
			const query = {};
			if (req.query.startupName) {
				query.startupName = {
					$regex: req.query.startupName,
					$options: "i",
				};
			}
			const cursor = startupsCollection.find(query);
			const result = await cursor.toArray();
			res.json(result);
		});

		// Get single startup details for startup details in Browse Startup Route
		app.get("/api/public/startups/:id", async (req, res) => {
			const { id } = req.params;
			const filter = {
				_id: new ObjectId(id),
			};
			const result = await startupsCollection.findOne(filter);
			res.json(result);
		});

		// Get All Opportunity by paricualr StartupId in Browse Startup & Browse Opportunity Route
		app.get("/api/public/opportunities/:id", async (req, res) => {
			const { id } = req.params;
			const filter = {
				startupId: id,
			};
			const result = await opportunitiesCollection.find(filter).toArray();
			res.json(result);
		});

		/* Get Opportunities For All Public, by Search and Filter Query and Have pagination - Browse Opportunity Route  */
		app.get("/api/public/opportunities", async (req, res) => {
			const {
				search = "",
				workType,
				industry,
				page = 1,
				limit = 9,
			} = req.query;

			const query = {};

			/* Search by Role Title and Required Skills */
			if (search) {
				query.$or = [
					{
						roleTitle: {
							$regex: search,
							$options: "i",
						},
					},
					{
						requiredSkills: {
							$regex: search,
							$options: "i",
						},
					},
				];
			}

			/* Filter by Work Type */
			if (workType) {
				query.workType = {
					$in: workType.split(","),
				};
			}

			/* Filter by Industry */
			if (industry) {
				query.industry = {
					$in: industry.split(","),
				};
			}

			const skip = (Number(page) - 1) * Number(limit);

			const opportunities = await opportunitiesCollection
				.find(query)
				.sort({
					createdAt: -1,
				})
				.skip(skip)
				.limit(Number(limit))
				.toArray();

			const total = await opportunitiesCollection.countDocuments(query);

			res.json({
				data: opportunities,
				pagination: {
					total,
					page: Number(page),
					limit: Number(limit),
					totalPages: Math.ceil(total / Number(limit)),
				},
			});
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
