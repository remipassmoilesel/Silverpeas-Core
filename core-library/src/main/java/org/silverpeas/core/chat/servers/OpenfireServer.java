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
 * <p>Openfire server management service</p>
 * <p>
 * <p>Configuration available in Silverpeas-Core/core-configuration/src/main/config/
 * properties/org/silverpeas/chat/settings/chatSettings.properties</p>
 * @author remipassmoilesel
 */
public class OpenfireServer implements ChatServer {

  private final String domain;
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
    this.domain = settings.getString("chat.xmpp.xmppDomain");

    this.requestHandler = new HttpRequestHandler();

  }

  /**
   * Create a user
   * @param login
   * @param password
   * @return
   */
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

      if (e instanceof ChatServerException) {
        throw (ChatServerException) e;
      } else {
        // other errors
        logger.error("Error while creating user: " + " / " + e.getClass().getName() + " / " +
            e.getMessage());

        throw new ChatServerException(ChatServerException.USER_CREATION_FAIL);
      }

    }
  }

  /**
   * Delete a user
   * @param login
   * @return
   */
  @Override
  public HttpRequestResponse deleteUser(final String login) {

    try {
      final HttpRequestResponse resp =
          requestHandler.doDelete(url + "/users/" + login, null, getAuthorizationHeaders());
      return resp;
    } catch (Exception e) {

      logger.error("Error while deleting user: " + " / " + e.getClass().getName() + " / " +
          e.getMessage());

      throw new ChatServerException(ChatServerException.USER_DELETION_FAIL);
    }

  }

  /**
   * Create a relationship between users
   * @param login1
   * @param login2
   * @return
   */
  public HttpRequestResponse createRelationShip(String login1, String login2) {

    ArrayList<BasicNameValuePair> datas = new ArrayList<>();
    datas.add(new BasicNameValuePair("jid", login2 + "@" + domain));

    try {
      final HttpRequestResponse resp = requestHandler
          .doPost(url + "/users/" + login1 + "/roster", datas, getAuthorizationHeaders());

      // throw if relationship already exist on server
      if (resp.getCode() == 409) {
        throw new ChatServerException(ChatServerException.RELATIONSHIP_ALREADY_EXIST);
      }

      return resp;
    } catch (Exception e) {

      if (e instanceof ChatServerException) {
        throw (ChatServerException) e;
      } else {
        // other errors
        logger
            .error("Error while creating relationship: " + " / " + e.getClass().getName() + " / " +
                e.getMessage());

        throw new ChatServerException(ChatServerException.RELATIONSHIP_CREATION_FAIL);
      }

    }

  }

  /**
   * Delete a relationship between users
   * @param login1
   * @param login2
   * @return
   */
  public HttpRequestResponse deleteRelationShip(String login1, String login2) {

    try {
      final HttpRequestResponse resp = requestHandler
          .doDelete(url + "/users/" + login1 + "/roster/" + login2 + "@" + domain, null,
              getAuthorizationHeaders());
      return resp;
    } catch (Exception e) {

      // other errors
      logger.error("Error while deleting relationship: " + " / " + e.getClass().getName() + " / " +
          e.getMessage());

      throw new ChatServerException(ChatServerException.RELATIONSHIP_DELETION_FAIL);
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

    // fail while retrieve user list
    return null;
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

}
