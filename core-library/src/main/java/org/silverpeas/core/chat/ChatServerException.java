package org.silverpeas.core.chat;

import org.silverpeas.core.SilverpeasRuntimeException;

/**
 * Thrown when an error need external intervention to be fixed
 */
public class ChatServerException extends SilverpeasRuntimeException {

  /**
   * User already exist on chat server
   */
  public static final String USER_ALREADY_EXIST = "USER_ALREADY_EXIST";

  public static final String USER_CREATION_FAIL = "USER_CREATION_FAIL";
  public static final String USER_DELETE_FAIL = "USER_DELETE_FAIL";

  public ChatServerException(final String message) {
    super(message);
  }

}
