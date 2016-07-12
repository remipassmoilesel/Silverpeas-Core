package org.silverpeas.core.chat.servers;

import org.silverpeas.core.chat.HttpRequestResponse;

/**
 * Interface for handle chat server
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

}
