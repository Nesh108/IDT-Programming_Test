package ws;

import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.json.JSONObject;

import spark.Spark;

public class RestServer {

	static Logger log = Logger.getLogger(RestServer.class.getName()); // Class
																		// logger
	JSONObject json; // JSON handler
	MongoHandler mh;

	public RestServer(boolean debug) {
		this(debug, Config.PORT);
	}

	public RestServer(boolean debug, int port) {

		BasicConfigurator.configure();
		setLogger(debug); // Setting the logger level
		start(port); // Starts REST server at specific port
		mh = new MongoHandler();

	}

	private void setLogger(boolean debug) {

		if (debug) {
			log.setLevel(Level.DEBUG);
			log.debug("DEBUG Mode");
		} else
			log.setLevel(Level.INFO);
	}

	private void start(int port) {

		// Starting up the REST server and setting the routes
		Spark.port(port);

		log.info("API: Server listening on: " + port);

		// Welcome Message
		Spark.get("/",
				(req, res) -> "Welcome to the IDT-Test API. Read the Developer documentation for more information.");

		// GET: Read user ID
		Spark.get("/user/:id", (req, res) -> mh.getUser(req.params(":id")));

		// POST: Creates user given ID
		Spark.post("/user/:name", (req, res) -> {
			mh.insertUser(req.params(":name"));
			json = new JSONObject();
			return json.put("message", "User '" + req.params(":name") + "' created.").toString();
		});

		// PUT: Change user name
		Spark.put("/user/:id", (req, res) -> mh.updateUser(req.params(":id"), req.queryMap().get("name").value()));

	}

}
