package org.silverpeas.web.chat;

import org.silverpeas.core.admin.service.AdminController;
import org.silverpeas.core.admin.user.model.UserDetail;
import org.silverpeas.core.util.JSONCodec;
import org.silverpeas.core.util.logging.SilverLogger;
import org.silverpeas.web.socialnetwork.invitation.servlets.InvitationJSONActions;

import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Writer;

import static org.silverpeas.web.socialnetwork.invitation.servlets.InvitationJSONActions
    .SendInvitation;

/**
 * Helper for chat client, which allow it to retrieve informations about users
 * @author remipassmoilesel
 */
public class ChatUserInformationsServlet extends HttpServlet {

  private SilverLogger logger = SilverLogger.getLogger(this);

  @Inject
  private AdminController adminController;

  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    doPost(request, response);
  }

  protected void doPost(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {

    res.setContentType("application/json");

    Writer writer = res.getWriter();

    ChatUserInformationsAction action =
        ChatUserInformationsAction.valueOf(req.getParameter("Action"));

    String jsonResultStr = "";
    switch (action) {
      case GetUserById: {
        UserDetail detail = UserDetail.getById(req.getParameter("UserId"));
        jsonResultStr = serializeUser(detail);
      }
    }

    writer.write(jsonResultStr);

  }

  /**
   * Encode an user detail in JSON string
   * @param detail
   * @return
   */
  private static String serializeUser(UserDetail detail) {
    return JSONCodec.encodeObject(json -> {
      json.put("login", detail.getLogin());
      json.put("domainId", detail.getDomainId());
      json.put("success", true);
      return json;
    });
  }


}
