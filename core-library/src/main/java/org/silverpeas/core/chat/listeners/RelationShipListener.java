package org.silverpeas.core.chat.listeners;

import org.silverpeas.core.admin.user.UserService;
import org.silverpeas.core.admin.user.model.UserDetail;
import org.silverpeas.core.admin.user.model.UserFull;
import org.silverpeas.core.admin.user.notification.UserEvent;
import org.silverpeas.core.chat.ChatServerException;
import org.silverpeas.core.chat.HttpRequestResponse;
import org.silverpeas.core.chat.servers.ChatServer;
import org.silverpeas.core.notification.system.CDIResourceEventListener;
import org.silverpeas.core.socialnetwork.relationShip.RelationShip;
import org.silverpeas.core.socialnetwork.relationShip.RelationShipEvent;
import org.silverpeas.core.util.logging.SilverLogger;

import javax.inject.Inject;

/**
 * Listen relationship modifications to clone them in Chat server
 * @author remipassmoilesel
 */
public class RelationShipListener extends CDIResourceEventListener<RelationShipEvent> {

  // Fake invitation to paste in PgAdmin III sb_sn_invitation
  // 8;0;3;"";"2016-07-18 13:24:51.525"
  // 6;0;3;"''";"2016-07-18 15:41:57.652"
  // 7;0;3;"''";"2016-07-18 16:15:15.718"

  private SilverLogger logger = SilverLogger.getLogger(this);

  @Inject
  private ChatServer server;

  @Override
  public void onCreation(final RelationShipEvent event) throws Exception {

    logger.info("Silverpeas relationship have been created");
    logger.info(event.toString());

    // prepare ids
    final RelationShip rs = event.getTransition().getAfter();

    UserFull uf1 = UserFull.getById(String.valueOf(rs.getUser1Id()));
    UserFull uf2 = UserFull.getById(String.valueOf(rs.getUser2Id()));

    logger.info("Relation: " + uf1.getLogin() + " / " + uf2.getLogin());

    HttpRequestResponse resp = null;
    try {

       resp = server.createRelationShip(uf1, uf2);

    } catch (ChatServerException e) {

      // do not throw if relation ship already exist
      if (ChatServerException.RELATIONSHIP_ALREADY_EXIST.equals(e.getMessage()) != true) {
        throw e;
      }

      logger.warn("Relationship already exist: " + uf1.getLogin() + " / " + uf2.getLogin());

    }

    logger.info("XMPP relationship have been created");
    logger.info(resp != null ? resp.toString() : "HTTP response: null");
  }

  @Override
  public void onDeletion(final RelationShipEvent event) throws Exception {

    logger.info("Silverpeas relationShip have been deleted");
    logger.info(event.toString());

    // prepare ids
    final RelationShip rs = event.getTransition().getBefore();

    UserFull uf1 = UserFull.getById(String.valueOf(rs.getUser1Id()));
    UserFull uf2 = UserFull.getById(String.valueOf(rs.getUser2Id()));

    final HttpRequestResponse resp = server.deleteRelationShip(uf1, uf2);

    logger.info("XMPP relationship have been deleted");
    logger.info(resp.toString());
  }
}
