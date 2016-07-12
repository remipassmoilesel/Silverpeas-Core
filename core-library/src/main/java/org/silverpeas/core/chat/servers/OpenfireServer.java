package org.silverpeas.core.chat.servers;

import org.apache.http.message.BasicNameValuePair;
import org.silverpeas.core.chat.ChatServerException;
import org.silverpeas.core.chat.HttpRequestHandler;
import org.silverpeas.core.chat.HttpRequestResponse;
import org.silverpeas.core.util.ResourceLocator;
import org.silverpeas.core.util.SettingBundle;
import org.silverpeas.core.util.logging.SilverLogger;


import java.util.ArrayList;

/**
 * Openfire server service
 * <p>
 * Configuration available in Silverpeas-Core/core-configuration/src/main/config/
 * properties/org/silverpeas/chat/settings/chatSettings.properties
 */
public class OpenfireServer implements ChatServer {

  private SilverLogger logger = SilverLogger.getLogger(this);

  /**
   * URL where execute REST queries
   */
  private final String url;

  /**
   * Authentication key
   */
  private final String key;

  /**
   * Utility for REST queries
   */
  private final HttpRequestHandler requestHandler;

  public OpenfireServer() {

    SettingBundle settings = ResourceLocator.getSettingBundle("org.silverpeas.chat.settings.chat");

    this.url = settings.getString("chat.xmpp.restUrl");
    this.key = settings.getString("chat.xmpp.restKey");

    this.requestHandler = new HttpRequestHandler();

  }

  /**
   * Return authorization headers
   * @return
   */
  private ArrayList<BasicNameValuePair> getAuthorizationHeaders() {

    ArrayList<BasicNameValuePair> headers = new ArrayList<>();

    headers.add(new BasicNameValuePair("Authorization", key));

    return headers;
  }

  @Override
  public HttpRequestResponse createUser(final String login, final String password) {

    ArrayList<BasicNameValuePair> datas = new ArrayList<>();
    datas.add(new BasicNameValuePair("username", login));
    datas.add(new BasicNameValuePair("password", password));

    try {
      final HttpRequestResponse resp =
          requestHandler.doPost(url + "/users", datas, getAuthorizationHeaders());

      // throw if user already exist on server
      if (resp.getCode() == 409) {
        throw new ChatServerException(ChatServerException.USER_ALREADY_EXIST);
      }

      return resp;
    } catch (Exception e) {

      // other errors
      logger.error("Error while creating user: " + " / " + e.getClass().getName() + " / " +
          e.getMessage());

      throw new ChatServerException(ChatServerException.USER_CREATION_FAIL);

    }
  }

  @Override
  public HttpRequestResponse deleteUser(final String login) {

    try {
      final HttpRequestResponse resp =
          requestHandler.doDelete(url + "/users/" + login, null, getAuthorizationHeaders());
      return resp;
    } catch (Exception e) {

      logger.error("Error while deleting user: " + " / " + e.getClass().getName() + " / " +
          e.getMessage());

      throw new ChatServerException(ChatServerException.USER_DELETE_FAIL);
    }

  }

  /**
   * Return the user list
   * @return
   */
  public HttpRequestResponse getUserList() {

    try {
      final HttpRequestResponse resp =
          requestHandler.doGet(url + "/users", null, getAuthorizationHeaders());
      return resp;
    } catch (Exception e) {
      logger.warn("Error while formatting HTTP response", e);
    }

    return null;
  }


}
