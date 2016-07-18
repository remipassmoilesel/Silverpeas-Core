package org.silverpeas.core.chat;

import org.silverpeas.core.SilverpeasRuntimeException;

/**
 * Thrown when an error need external intervention to be fixed
 *
 * @author remipassmoilesel
 */
public class ChatServerException extends SilverpeasRuntimeException {

  /**
   * User already exist on chat server
   */
  public static final String USER_ALREADY_EXIST = "USER_ALREADY_EXIST";
  /**
   * Error while creating user
   */
  public static final String USER_CREATION_FAIL = "USER_CREATION_FAIL";
  /**
   * Error while deleting user
   */
  public static final String USER_DELETION_FAIL = "USER_DELETION_FAIL";


  /**
   * Relationship already exist
   */
  public static final String RELATIONSHIP_ALREADY_EXIST = "RELATIONSHIP_ALREADY_EXIST";
  /**
   * Error while creating relationship
   */
  public static final String RELATIONSHIP_CREATION_FAIL = "RELATIONSHIP_CREATION_FAIL";
  /**
   * Error while deleting relationship
   */
  public static final String RELATIONSHIP_DELETION_FAIL = "RELATIONSHIP_DELETION_FAIL";

  public ChatServerException(final String message) {
    super(message);
  }

}
