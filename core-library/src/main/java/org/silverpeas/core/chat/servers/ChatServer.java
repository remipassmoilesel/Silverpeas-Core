package org.silverpeas.core.chat.servers;

import org.silverpeas.core.admin.user.model.UserFull;
import org.silverpeas.core.chat.HttpRequestResponse;

/**
 * Interface for handle chat server
 * @author remipassmoilesel
 */
public interface ChatServer {

  /**
   * Create a user on distant server
   *
   * @param user
   * @return
   */
  public HttpRequestResponse createUser(UserFull user);

  /**
   * Delete a user on a distant server
   *
   * @param user
   * @return
   */
  public HttpRequestResponse deleteUser(UserFull user);

  /**
   * Create a relationship from user1 to user 2
   *
   * @param user1
   * @param user1
   * @return
   */
  public HttpRequestResponse createRelationShip(UserFull user1, UserFull user2);

  /**
   * Delete a relationship from user1 to user2
   *
   * @param user1
   * @param user2
   * @return
   */
  public HttpRequestResponse deleteRelationShip(UserFull user1, UserFull user2);

}
