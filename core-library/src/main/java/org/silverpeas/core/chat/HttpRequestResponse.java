package org.silverpeas.core.chat;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.silverpeas.core.util.logging.SilverLogger;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URLConnection;

/**
 * Wrapper for HTTP request response
 */
public class HttpRequestResponse {

  /**
   * Parse for JSON
   */
  private final JSONParser parser;

  /**
   * Response code
   */
  private int code;

  /**
   * Body of response
   */
  private String response;

  /**
   * Origin connection
   */
  private URLConnection con;

  /**
   * Http request response wrapper
   * @param con
   */
  public HttpRequestResponse(HttpURLConnection con) {

    this.parser = new JSONParser();

    this.con = con;

    try {

      // get response code
      this.code = con.getResponseCode();

      String inputLine;
      BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
      StringBuffer sb = new StringBuffer();

      while ((inputLine = in.readLine()) != null) {
        sb.append(inputLine);
      }
      in.close();

      this.response = sb.toString();

    } catch (Exception e) {
      SilverLogger.getLogger(this).warn(
          "Error while formatting HTTP response: " + " / " + e.getClass().getName() + " / " +
              e.getMessage());
    }

  }

  /**
   * Get response code
   * @return
   */
  public int getCode() {
    return code;
  }

  /**
   * Get raw response body
   * @return
   */
  public String getResponse() {
    return response;
  }

  /**
   * Return body of response wrapped in a JSON Object
   * @return
   */
  public JSONObject getJSONResponse() {
    try {
      return (JSONObject) parser.parse(response);
    } catch (ParseException e) {
      SilverLogger.getLogger(this).warn("Error while parsing JSON response");
      e.printStackTrace();
    }

    return null;
  }

  @Override
  public String toString() {
    return "HttpRequestResponse{" +
        "code=" + code +
        ", response='" + response + '\'' +
        ", con=" + con +
        '}';
  }
}

