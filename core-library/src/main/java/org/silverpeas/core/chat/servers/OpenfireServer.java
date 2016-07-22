package org.silverpeas.core.chat.servers;

import org.apache.http.message.BasicNameValuePair;
import org.silverpeas.core.admin.user.model.UserFull;
import org.silverpeas.core.chat.ChatServerException;
import org.silverpeas.core.chat.HttpRequestHandler;
import org.silverpeas.core.chat.HttpRequestResponse;
import org.silverpeas.core.util.ResourceLocator;
import org.silverpeas.core.util.SettingBundle;
import org.silverpeas.core.util.logging.SilverLogger;


import java.util.ArrayList;

import static org.silverpeas.core.util.MailUtil.getLogin;

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

  @Override
  public HttpRequestResponse createUser(final UserFull user) {

    // get cross domain login and password
    String login = getNodeFromUser(user);
    String password = user.getToken();

    ArrayList<BasicNameValuePair> datas = new ArrayList<>();
    datas.add(new BasicNameValuePair("username", login));
    datas.add(new BasicNameValuePair("password", password));

    try {
      final HttpRequestResponse resp =
          requestHandler.doPost(url + "/users", datas, getAuthorizationHeaders());

      if (resp.getCode() != 201) {
        logger.error("Error while creating XMPP user");
        logger.error(resp.toString());
        throw new ChatServerException(ChatServerException.USER_CREATION_FAIL);
      }

      return resp;
    }

    catch (Exception e) {
      logger.error("Error while creating XMPP user");
      logger.error(e.getClass().getName() + " / " + e.getMessage());
      throw new ChatServerException(ChatServerException.USER_CREATION_FAIL);
    }
  }

  @Override
  public HttpRequestResponse deleteUser(final UserFull user) {

    String login = getNodeFromUser(user);

    try {
      final HttpRequestResponse resp =
          requestHandler.doDelete(url + "/users/" + login, null, getAuthorizationHeaders());

      if (resp.getCode() != 200) {
        logger.error("Error while deleting XMPP user");
        logger.error(resp.toString());
        throw new ChatServerException(ChatServerException.USER_DELETION_FAIL);
      }

      return resp;

    } catch (Exception e) {
      logger.error("Error while deleting XMPP user");
      logger.error(e.getClass().getName() + " / " + e.getMessage());
      throw new ChatServerException(ChatServerException.USER_CREATION_FAIL);
    }

  }

  @Override
  public HttpRequestResponse createRelationShip(final UserFull user1, final UserFull user2) {

    String login1 = getNodeFromUser(user1);

    ArrayList<BasicNameValuePair> datas = new ArrayList<>();
    datas.add(new BasicNameValuePair("jid", getJidFromUser(user2)));
    datas.add(new BasicNameValuePair("subscriptionType", "3"));

    try {
      final HttpRequestResponse resp = requestHandler
          .doPost(url + "/users/" + login1 + "/roster", datas, getAuthorizationHeaders());

      // throw special error if relationship already exist on server
      if (resp.getCode() == 409) {
        throw new ChatServerException(ChatServerException.RELATIONSHIP_ALREADY_EXIST);
      }

      else if (resp.getCode() != 201) {
        logger.error("Error while creating XMPP relationship");
        logger.error(resp.toString());
        throw new ChatServerException(ChatServerException.RELATIONSHIP_CREATION_FAIL);
      }

      return resp;
    } catch (Exception e) {

      logger.error("Error while creating XMPP relationship");
      logger.error(e.getClass().getName() + " / " + e.getMessage());
      throw new ChatServerException(ChatServerException.RELATIONSHIP_CREATION_FAIL);

    }

  }

  @Override
  public HttpRequestResponse deleteRelationShip(final UserFull user1, final UserFull user2) {

    String login1 = getNodeFromUser(user1);
    String jid2 = getJidFromUser(user2);

    try {
      final HttpRequestResponse resp = requestHandler
          .doDelete(url + "/users/" + login1 + "/roster/" + jid2, null,
              getAuthorizationHeaders());

      if (resp.getCode() != 200) {
        logger.error("Error while creating XMPP relationship");
        logger.error(resp.toString());
        throw new ChatServerException(ChatServerException.RELATIONSHIP_DELETION_FAIL);
      }

      return resp;

    } catch (Exception e) {
      logger.error("Error while creating XMPP relationship");
      logger.error(e.getClass().getName() + " / " + e.getMessage());
      throw new ChatServerException(ChatServerException.RELATIONSHIP_DELETION_FAIL);
    }

  }

  /**
   * Return authorization headers for REST access
   * @return
   */
  private ArrayList<BasicNameValuePair> getAuthorizationHeaders() {

    ArrayList<BasicNameValuePair> headers = new ArrayList<>();

    headers.add(new BasicNameValuePair("Authorization", key));

    return headers;
  }

  /**
   * Create a cross domain XMPP complete id from user
   * @param user
   * @return
   */
  public String getJidFromUser(final UserFull user) {
    return getNodeFromUser(user) + "@" + domain;
  }

  /**
   * Create a cross domain XMPP login from user
   * @param user
   * @return
   */
  private String getNodeFromUser(final UserFull user) {
    return user.getLogin() + user.getId();
  }
}
