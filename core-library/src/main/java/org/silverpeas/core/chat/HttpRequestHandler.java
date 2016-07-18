package org.silverpeas.core.chat;

import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.json.simple.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;

/**
 * Utility for sending HTTP requests
 *
 * @author remipassmoilesel
 */
public class HttpRequestHandler {

  private final String USER_AGENT = "Silverpeas chat management module";

  public final static String GET = "GET";
  public final static String POST = "POST";
  public final static String DELETE = "DELETE";

  /**
   * Do an HTTP request
   * @param url
   * @param method
   * @param rawData
   * @param headers
   * @return
   * @throws Exception
   */
  public HttpRequestResponse doRequest(String url, String method,
      ArrayList<? extends NameValuePair> rawData, ArrayList<? extends NameValuePair> headers)
      throws Exception {

    // prepare datas
    if (rawData == null) {
      rawData = new ArrayList<>();
    }

    // change URL if get datas
    if (method.equals(GET)) {
      String encodedParams = URLEncodedUtils.format(rawData, "UTF-8");
      url += "?" + encodedParams;
    }

    // prepare connexion
    URL obj = new URL(url);
    HttpURLConnection con = (HttpURLConnection) obj.openConnection();

    con.setRequestMethod(method);

    con.setRequestProperty("User-Agent", USER_AGENT);
    con.setRequestProperty("Accept", "application/json");
    con.setRequestProperty("Content-Type", "application/json; charset=UTF-8");

    // prepare custom headers
    if (headers == null) {
      headers = new ArrayList<>();
    }

    for (NameValuePair header : headers) {
      con.setRequestProperty(header.getName(), header.getValue());
    }

    // send datas
    if (method.equals(POST)) {

      con.setDoOutput(true);

      JSONObject data = new JSONObject();
      for(NameValuePair pair : rawData){
        data.put(pair.getName(), pair.getValue());
      }

      OutputStream os = con.getOutputStream();
      os.write(data.toJSONString().getBytes("UTF-8"));
      os.close();

    }

    return new HttpRequestResponse(con);

  }

  /**
   * Do a GET request
   * @param url
   * @param data
   * @param headers
   * @return
   * @throws Exception
   */
  public HttpRequestResponse doGet(String url, ArrayList<? extends NameValuePair> data,
      ArrayList<? extends NameValuePair> headers) throws Exception {
    return doRequest(url, GET, data, headers);
  }

  /**
   * Do a post request
   * @param url
   * @param data
   * @param headers
   * @return
   * @throws Exception
   */
  public HttpRequestResponse doPost(String url, ArrayList<? extends NameValuePair> data,
      ArrayList<? extends NameValuePair> headers) throws Exception {
    return doRequest(url, POST, data, headers);
  }

  /**
   * Do a delete request
   * @param url
   * @param data
   * @param headers
   * @return
   * @throws Exception
   */
  public HttpRequestResponse doDelete(String url, ArrayList<? extends NameValuePair> data,
      ArrayList<? extends NameValuePair> headers) throws Exception {
    return doRequest(url, DELETE, data, headers);
  }

}
