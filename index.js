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
		// await client.connect();

		/* Database Collections */
		const db = client.db("startupforge");
		const plansCollection = db.collection("plans");
		const startupsCollection = db.collection("startups");
		const opportunitiesCollection = db.collection("opportunities");
		const applicationsCollection = db.collection("applications");
		const usersCollection = db.collection("user");
		const sessionsCollection = db.collection("session");
		const subscriptionsCollection = db.collection("subscriptions");

		/* ===============Middleware Verifications =====================*/
		/* Verification using authHeader, session, token, user, isBlocked */
		const verifyToken = async (req, res, next) => {
			try {
				const authHeader = req.headers?.authorization;
				// If there is no header data
				if (!authHeader?.startsWith("Bearer ")) {
					return res.status(401).json({
						message: "Unauthorized access",
					});
				}

				// Get Token and the session
				const token = authHeader.split(" ")[1];
				const session = await sessionsCollection.findOne({
					token,
				});

				// If there is no session
				if (!session) {
					return res.status(401).json({
						message: "Invalid session",
					});
				}

				// If have session then get user by userId under session
				const user = await usersCollection.findOne({
					_id: session.userId,
				});

				// If there is no user
				if (!user) {
					return res.status(401).json({
						message: "User not found",
					});
				}

				// If user is blocked
				if (user.isBlocked) {
					return res.status(403).json({
						message: "Account blocked",
					});
				}

				// If all clear then set the user in req
				req.user = user;

				// run in next
				next();
			} catch (error) {
				// If any server error
				console.error(error);
				return res.status(500).json({
					message: "Internal Server Error",
				});
			}
		};

		/* Role based verifications - Reusable Functions */
		const requireRole = (role) => {
			return (req, res, next) => {
				if (req.user.role !== role) {
					return res.status(403).json({
						message: "Forbidden",
					});
				}

				next();
			};
		};

		/*========Admin CRUD Operations only For - Admin Role============*/
		/* Get all users information for admin role */
		app.get(
			"/api/admin/users",
			verifyToken,
			requireRole("admin"),
			async (req, res) => {
				const result = await usersCollection.find().toArray();
				res.json(result);
			},
		);

		// Update User Block or Unblocked Status
		app.patch(
			"/api/admin/users/:id",
			verifyToken,
			requireRole("admin"),
			async (req, res) => {
				const { id } = req.params;
				const filter = {
					_id: new ObjectId(id),
				};
				const updatedData = {
					$set: req.body,
				};
				const result = await usersCollection.updateOne(
					filter,
					updatedData,
				);
				res.json(result);
			},
		);

		/*===============Plans Get APIS==============*/
		app.get("/api/plans", verifyToken, async (req, res) => {
			const query = {};
			if (req.query.planId) {
				query.planId = req.query.planId;
			}
			const result = await plansCollection.findOne(query);
			res.json(result);
		});

		/*===============Startup CRUD API - For Founder Role=======================*/
		/* Create Startups Api, For Founder Role */
		app.post(
			"/api/startups",
			verifyToken,
			requireRole("founder"),
			async (req, res) => {
				const startupsData = req.body;
				const newStartupsData = {
					...startupsData,
					createdAt: new Date(),
				};
				const result =
					await startupsCollection.insertOne(newStartupsData);
				res.json(result);
			},
		);

		/* Get Founder Startup by Founder Email, For Founder Role */
		app.get(
			"/api/startups",
			verifyToken,
			requireRole("founder"),
			async (req, res) => {
				const query = {};
				if (req.query.founderEmail) {
					query.founderEmail = req.query.founderEmail;
				}
				const result = await startupsCollection.findOne(query);
				res.json(result);
			},
		);

		/*--Update Startup, For Founder & "ADMIN" Role---*/
		app.patch("/api/startups/:id", verifyToken, async (req, res) => {
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

		/*---Delete Startup with all their Opportunities, For Founder & "ADMIN" Role---*/
		app.delete("/api/startups/:id", verifyToken, async (req, res) => {
			const { id } = req.params;
			const result = await startupsCollection.deleteOne({
				_id: new ObjectId(id),
			});
			await opportunitiesCollection.deleteMany({
				startupId: id,
			});
			res.json(result);
		});

		/*===============Opportunity CRUD API - For Founder Role==================*/
		/* Create Opportunity By Founder, For Founder Role*/
		app.post(
			"/api/opportunities",
			verifyToken,
			requireRole("founder"),
			async (req, res) => {
				const opportunityData = req.body;
				const newOpportunityData = {
					...opportunityData,
					createdAt: new Date(),
				};
				const result =
					await opportunitiesCollection.insertOne(newOpportunityData);
				res.json(result);
			},
		);

		/* Get Opportunities by FounderId, For Founder Role */
		app.get("/api/opportunities", verifyToken, async (req, res) => {
			const query = {};
			if (req.query.founderId) {
				query.founderId = req.query.founderId;
			}
			const cursor = opportunitiesCollection.find(query);
			const result = await cursor.toArray();
			res.json(result);
		});

		/* Update Opportunities Data by founder, For Founder Role */
		app.patch(
			"/api/opportunities/:id",
			verifyToken,
			requireRole("founder"),
			async (req, res) => {
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
			},
		);

		/* Delete opportunity by founder, For Founder Role  */
		app.delete(
			"/api/opportunities/:id",
			verifyToken,
			requireRole("founder"),
			async (req, res) => {
				const { id } = req.params;
				const result = await opportunitiesCollection.deleteOne({
					_id: new ObjectId(id),
				});
				res.json(result);
			},
		);

		/*===========Applications CRUD API - For Founder & Collaborator Role====================*/
		/* Submit new apllication all role can submit */
		app.post("/api/applications", verifyToken, async (req, res) => {
			const applicationData = req.body;
			const newApplicationData = {
				...applicationData,
				createdAt: new Date(),
			};
			const result =
				await applicationsCollection.insertOne(newApplicationData);
			res.json(result);
		});

		/* Get Application Data by applicantId, OpportunityId & founderId - For Founder and Collaborator*/
		app.get("/api/applications", verifyToken, async (req, res) => {
			const query = {};
			if (req.query.opportunityId) {
				query.opportunityId = req.query.opportunityId;
			}
			if (req.query.founderId) {
				query.founderId = req.query.founderId;
			}
			if (req.query.applicantId) {
				query.applicantId = req.query.applicantId;
			}
			const result = await applicationsCollection.find(query).toArray();
			res.json(result);
		});

		/* Update Applications Status Approve or Reject - For Founder Role Only */
		app.patch(
			"/api/applications/:id",
			verifyToken,
			requireRole("founder"),
			async (req, res) => {
				const { id } = req.params;
				const filter = {
					_id: new ObjectId(id),
				};
				const updatedData = req.body;
				const updatedStatus = {
					$set: {
						status: updatedData.status,
					},
				};
				const result = await applicationsCollection.updateOne(
					filter,
					updatedStatus,
				);

				res.json(result);
			},
		);

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

		// Get Single Opportunity by opportunity_id for Oppotunity Details Page
		app.get("/api/public/opportunity/:id", async (req, res) => {
			const { id } = req.params;
			const result = await opportunitiesCollection.findOne({
				_id: new ObjectId(id),
			});
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

		/*======Subscription and User Plans Update API - For Loggedin and Payment Success User===============*/
		/* Add new subcription and update user role */
		app.post(
			"/api/success/subscriptions",
			verifyToken,
			async (req, res) => {
				const subscriptionData = req.body;
				const newSubscriptionData = {
					...subscriptionData,
					createdAt: new Date(),
				};
				await subscriptionsCollection.insertOne(newSubscriptionData);

				//Update user plan
				const filter = {
					_id: new ObjectId(subscriptionData?.userId),
				};
				const updatedPlan = {
					$set: {
						plan: subscriptionData?.upgradedPlan,
					},
				};
				const updatedPlanStatus = await usersCollection.updateOne(
					filter,
					updatedPlan,
				);

				res.json(updatedPlanStatus);
			},
		);

		/* Get All Subscriptions + Monthly Revenue and Total Revenue - Genareted by AI - Only For Admin Role*/
		app.get(
			"/api/success/subscriptions",
			verifyToken,
			requireRole("admin"),
			async (req, res) => {
				const subscriptions = await subscriptionsCollection
					.find()
					.sort({ createdAt: -1 })
					.toArray();

				const revenueStats = await subscriptionsCollection
					.aggregate([
						{
							$match: {
								paymentStatus: "paid",
							},
						},
						{
							$facet: {
								totalRevenue: [
									{
										$group: {
											_id: null,
											totalRevenue: {
												$sum: "$amount",
											},
										},
									},
								],

								monthlyRevenue: [
									{
										$group: {
											_id: {
												year: {
													$year: "$createdAt",
												},
												month: {
													$month: "$createdAt",
												},
											},
											revenue: {
												$sum: "$amount",
											},
										},
									},
									{
										$sort: {
											"_id.year": 1,
											"_id.month": 1,
										},
									},
								],
							},
						},
					])
					.toArray();

				res.json({
					subscriptions,

					totalRevenue:
						revenueStats[0]?.totalRevenue?.[0]?.totalRevenue || 0,

					monthlyRevenue:
						revenueStats[0]?.monthlyRevenue.map((item) => ({
							month: new Date(
								item._id.year,
								item._id.month - 1,
							).toLocaleString("en-US", {
								month: "short",
							}),
							revenue: item.revenue,
						})) || [],
				});
			},
		);

		// await client.db("admin").command({ ping: 1 });
		// console.log(
		// 	"Pinged your deployment. You successfully connected to MongoDB!",
		// );
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
