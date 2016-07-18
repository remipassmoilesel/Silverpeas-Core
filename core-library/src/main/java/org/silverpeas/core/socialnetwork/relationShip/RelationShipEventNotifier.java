package org.silverpeas.core.socialnetwork.relationShip;

/*
 * Copyright (C) 2000 - 2016 Silverpeas
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the
 * GNU Affero General Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * As a special exception to the terms and conditions of version 3.0 of the GPL, you may
 * redistribute this Program in connection with Free/Libre Open Source Software ("FLOSS")
 * applications as described in Silverpeas's FLOSS exception. You should have received a copy of the
 * text describing the FLOSS exception, and it is also available here:
 * "http://www.silverpeas.org/docs/core/legal/floss_exception.html"
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */

import org.silverpeas.core.admin.user.model.UserDetail;
import org.silverpeas.core.admin.user.notification.UserEvent;
import org.silverpeas.core.notification.system.AbstractResourceEvent;
import org.silverpeas.core.notification.system.CDIResourceEventNotifier;
import org.silverpeas.core.notification.system.ResourceEvent;
import org.springframework.social.linkedin.api.Relation;

import java.io.Serializable;


/**
 * <p>Notifier about creation or deletion of relationship between users.</p>
 * @author remipassmoilesel
 */
public class RelationShipEventNotifier
    extends CDIResourceEventNotifier<RelationShip, RelationShipEvent> {

  protected RelationShipEventNotifier() {
  }

  @Override
  protected RelationShipEvent createResourceEventFrom(final ResourceEvent.Type type,
      final RelationShip... resource) {
    return new RelationShipEvent(type, resource);
  }

  /**
   * Shortcut. Here sent relationships are not complete, only user ids are specified (missing type
   * of relation, initator, ...)
   * @param type
   * @param user1Id
   * @param user2Id
   */
  public void notifyEventOn(final ResourceEvent.Type type, final int user1Id, final int user2Id) {
    RelationShip rs = new RelationShip();
    rs.setUser1Id(user1Id);
    rs.setUser2Id(user2Id);

    notifyEventOn(type, rs);
  }

}

