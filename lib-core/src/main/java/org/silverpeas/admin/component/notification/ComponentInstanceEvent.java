/*
 * Copyright (C) 2000 - 2014 Silverpeas
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

package org.silverpeas.admin.component.notification;

import com.stratelia.webactiv.beans.admin.Admin;
import com.stratelia.webactiv.beans.admin.ComponentInst;
import org.apache.commons.lang3.tuple.Pair;
import org.silverpeas.notification.AbstractResourceEvent;
import org.silverpeas.notification.ResourceEvent;
import org.silverpeas.util.ServiceProvider;
import org.silverpeas.util.StringUtil;

/**
 * Events about the life-cycle of a component instance. They means to be triggered when a component
 * instance is created, deleted or updated.
 * @author mmoquillon
 */
public class ComponentInstanceEvent extends AbstractResourceEvent<ComponentInst> {

  protected ComponentInstanceEvent() {
    super();
  }

  /**
   * @see org.silverpeas.notification.AbstractResourceEvent#AbstractResourceEvent(org.silverpeas.notification.ResourceEvent.Type, Object[])
   */
  public ComponentInstanceEvent(final ResourceEvent.Type type,
      final ComponentInst ... componentInst) {
    super(type, componentInst);
  }

}