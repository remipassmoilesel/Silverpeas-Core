/**
 * Copyright (C) 2000 - 2013 Silverpeas
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * As a special exception to the terms and conditions of version 3.0 of
 * the GPL, you may redistribute this Program in connection with Free/Libre
 * Open Source Software ("FLOSS") applications as described in Silverpeas's
 * FLOSS exception.  You should have received a copy of the text describing
 * the FLOSS exception, and it is also available here:
 * "http://www.silverpeas.org/docs/core/legal/floss_exception.html"
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package com.silverpeas.domains.silverpeasdriver;

import org.silverpeas.persistence.model.identifier.UniqueIntegerIdentifier;
import org.silverpeas.persistence.repository.BasicEntityRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * @author ehugonnet
 */
public interface SPUserManager extends BasicEntityRepository<SPUser, UniqueIntegerIdentifier> {

  List<SPUser> findByFirstname(@Param("firstname") String firstName);

  List<SPUser> findByLastname(@Param("lastname") String lastName);

  List<SPUser> findByPhone(@Param("phone") String phone);

  List<SPUser> findByHomephone(@Param("homephone") String homephone);

  List<SPUser> findByCellphone(@Param("cellphone") String cellphone);

  List<SPUser> findByFax(@Param("fax") String fax);

  List<SPUser> findByAddress(@Param("address") String address);

  List<SPUser> findByTitle(@Param("title") String title);

  List<SPUser> findByCompany(@Param("company") String company);

  List<SPUser> findByPosition(@Param("position") String position);

  List<SPUser> findByEmail(@Param("email") String email);

}