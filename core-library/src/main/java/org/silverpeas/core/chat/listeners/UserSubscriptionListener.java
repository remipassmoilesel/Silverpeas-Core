package org.silverpeas.core.chat.listeners;

import org.silverpeas.core.admin.user.model.UserDetail;
import org.silverpeas.core.admin.user.model.UserFull;
import org.silverpeas.core.admin.user.notification.UserEvent;
import org.silverpeas.core.chat.HttpRequestResponse;
import org.silverpeas.core.chat.servers.ChatServer;
import org.silverpeas.core.notification.system.CDIResourceEventListener;
import org.silverpeas.core.util.logging.SilverLogger;

import javax.inject.Inject;

/**
 * Listen user modifications to clone them in Chat server
 *
 * @author remipassmoilesel
 */
public class UserSubscriptionListener extends CDIResourceEventListener<UserEvent> {

  private SilverLogger logger = SilverLogger.getLogger(this);

  @Inject
  private ChatServer server;

  @Override
  public void onCreation(final UserEvent event) throws Exception {

    logger.debug("Silverpeas user have been created");

    // prepare ids
    UserDetail detail = event.getTransition().getAfter();
    UserFull full = UserFull.getById(detail.getId());

    final HttpRequestResponse resp = server.createUser(detail.getLogin(), full.getToken());

    logger.info("Xmpp user have been created: " + detail.getLogin() + " / " + full.getToken());
    logger.info(resp.toString());

  }

  @Override
  public void onDeletion(final UserEvent event) throws Exception {

    logger.debug("Silverpeas user have been deleted");

    // prepare ids
    UserDetail detail = event.getTransition().getBefore();

    final HttpRequestResponse resp = server.deleteUser(detail.getLogin());

    logger.info("Xmpp user have been deleted: " + detail.getLogin());
    logger.info(resp.toString());

  }

}
