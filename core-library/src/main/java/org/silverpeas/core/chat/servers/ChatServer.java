package org.silverpeas.core.chat.servers;

import org.silverpeas.core.chat.HttpRequestResponse;

/**
 * Interface for handle chat server
 * @author remipassmoilesel
 */
public interface ChatServer {

  /**
   * Create a user on distant server
   * @param login
   * @param password
   * @return
   */
  public HttpRequestResponse createUser(String login, String password);

  /**
   * Delete a user on a distant server
   * @param login
   * @return
   */
  public HttpRequestResponse deleteUser(String login);

  /**
   * Create a relationship between users
   * @param login1
   * @param login2
   * @return
   */
  public HttpRequestResponse createRelationShip(String login1, String login2);

  /**
   * Delete a relationship between users
   * @param login1
   * @param login2
   * @return
   */
  public HttpRequestResponse deleteRelationShip(String login1, String login2);

}
