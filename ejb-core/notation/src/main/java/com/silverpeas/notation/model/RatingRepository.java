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

package com.silverpeas.notation.model;

import org.silverpeas.persistence.model.identifier.UniqueIntegerIdentifier;
import org.silverpeas.persistence.repository.jpa.JpaBasicEntityManager;
import org.silverpeas.persistence.repository.jpa.NamedParameters;
import org.silverpeas.rating.ContributionRating;
import org.silverpeas.rating.ContributionRatingPK;
import org.silverpeas.rating.RaterRatingPK;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * JPA repository of ratings. It provides business methods to operate on the persistence of the
 * ratings.
 * @author mmoquillon
 */
@Transactional
public class RatingRepository extends JpaBasicEntityManager<Rating, UniqueIntegerIdentifier> {

  public void deleteAllRatingsOfAContribution(ContributionRatingPK contribution) {
    NamedParameters parameters = newNamedParameters();
    parameters.add("contributionId", contribution.getId())
        .add("instanceId", contribution.getInstanceId())
        .add("contributionType", contribution.getContributionType());
    deleteFromNamedQuery("deleteAllByContribution", parameters);
  }

  public void deleteAllRatingsInComponentInstance(String instanceId) {
    NamedParameters parameters = newNamedParameters();
    parameters.add("instanceId", instanceId);
    deleteFromNamedQuery("deleteByInstanceId", parameters);
  }

  public Rating getRating(RaterRatingPK raterRating) {
    NamedParameters parameters = newNamedParameters();
    parameters.add("contributionId", raterRating.getId())
        .add("instanceId", raterRating.getInstanceId())
        .add("contributionType", raterRating.getContributionType())
        .add("authorId", raterRating.getRater().getId());
    return getFromNamedQuery("findByAuthorRating", parameters);
  }

  public Map<String, ContributionRating> getAllRatingByContributions(String instanceId,
      String contributionType, String... contributionIds) {
    NamedParameters parameters = newNamedParameters();
    parameters.add("instanceId", instanceId).add("contributionType", contributionType)
        .add("contributionIds", Arrays.asList(contributionIds));
    List<Rating> ratings = findByNamedQuery("findByContributions", parameters);
    Map<String, ContributionRating> ratingsByContribution = new HashMap<>(ratings.size());
    for (Rating rating : ratings) {
      ContributionRating contributionRating = ratingsByContribution.get(rating.getContributionId());
      if (contributionRating == null) {
        contributionRating = new ContributionRating(
            new ContributionRatingPK(rating.getContributionId(), rating.getInstanceId(),
                rating.getContributionType()));
      }
      contributionRating.addRaterRating(rating.getAuthorId(), rating.getNote());
    }
    return ratingsByContribution;
  }

  public void moveAllRatingsOfAContribution(ContributionRatingPK contribution, String instanceId) {
    NamedParameters parameters = newNamedParameters();
    parameters.add("contributionId", contribution.getId())
        .add("instanceId", contribution.getInstanceId())
        .add("contributionType", contribution.getContributionType())
        .add("newInstanceId", instanceId);
    updateFromNamedQuery("updateInstanceId", parameters);
  }
}