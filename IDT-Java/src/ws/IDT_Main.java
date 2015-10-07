package ws;

import java.util.Arrays;

public class IDT_Main {

	public static void main(String[] args) {

		boolean debug = false;
		int port = Config.PORT;

		// Checking given arguments
		if (Arrays.asList(args).contains("--debug") || Arrays.asList(args).contains("-d"))
			debug = true;

		if (Arrays.asList(args).indexOf("-p") != -1)
			try {
				port = Integer.parseInt(Arrays.asList(args).get(Arrays.asList(args).indexOf("-p") + 1));
			} catch (Exception e) {
				// the port was not defined
				System.out.println("Port given was missing or incorrect. Using default: " + Config.PORT);
			}

		// Starting the REST server
		new RestServer(debug, port);


	}

}
