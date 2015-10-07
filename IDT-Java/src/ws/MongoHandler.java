package ws;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.json.JSONObject;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoDatabase;

public class MongoHandler {

	MongoClient mc; // MongoDB Client for connecting to DB
	MongoDatabase db; // MongoDB object
	JSONObject json; // JSON handler

	public MongoHandler() {
		mc = new MongoClient(
				new MongoClientURI("mongodb://" + Config.DB_USER + ":" + Config.DB_PASS + "@" + Config.DB_HOST));
		db = mc.getDatabase("idt-test");
	}

	// Creates a new user given its name
	public void insertUser(String name) {
		db.getCollection("users").insertOne(new Document("name", name));
	}

	// Return user object given ID
	public String getUser(String id) {
		FindIterable<Document> user = db.getCollection("users").find(new Document("_id", new ObjectId(id)));

		// If not found, return appropriate message
		if (user.first() == null)
			return new JSONObject().put("error", "User not found").toString();

		return user.first().toJson();
	}

	// Updates user name given ID and new name
	public String updateUser(String id, String new_name) {
		json = new JSONObject();

		FindIterable<Document> user = db.getCollection("users").find(new Document("_id", new ObjectId(id)));

		// If not found, return appropriate message
		if (user.first() == null)
			return json.put("error", "User not found").toString();

		db.getCollection("users").updateOne(new Document("_id", new ObjectId(id)),
				new BasicDBObject("$set", new BasicDBObject("name", new_name)));

		return json.put("message", "User '" + id + "' name changed to '" + new_name + "'.").toString();

	}

}
