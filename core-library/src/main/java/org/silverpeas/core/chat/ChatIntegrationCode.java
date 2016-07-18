package org.silverpeas.core.chat;

import org.apache.ecs.ElementContainer;
import org.apache.ecs.xhtml.link;
import org.apache.ecs.xhtml.script;
import org.silverpeas.core.admin.user.model.UserDetail;
import org.silverpeas.core.admin.user.model.UserFull;
import org.silverpeas.core.util.ResourceLocator;
import org.silverpeas.core.util.SettingBundle;
import org.silverpeas.core.util.URLUtil;

import static org.bouncycastle.asn1.x500.style.RFC4519Style.userPassword;
import static org.jsoup.nodes.Entities.EscapeMode.xhtml;

/**
 * @author remipassmoilesel
 */
public class ChatIntegrationCode {

  public static String CHAT_CLIENT_DIR = URLUtil.getApplicationURL() + "/chatclient/";
  public static String CHAT_CLIENT_STYLES = CHAT_CLIENT_DIR + "css/jsxc.css";
  public static String CHAT_CLIENT_DEPENDENCIES = CHAT_CLIENT_DIR + "lib/jsxc.dep.js";
  public static String CHAT_CLIENT_MAIN = CHAT_CLIENT_DIR + "jsxc.js";
  public static String CHAT_CLIENT_INIT = CHAT_CLIENT_DIR + "jsxc_init.js";

  private static final String JAVASCRIPT_TYPE = "text/javascript";
  private static final String STYLESHEET_TYPE = "text/css";
  private static final String STYLESHEET_REL = "stylesheet";

  public static final String addIntegrationCode(final ElementContainer xhtml) {

    // add client style
    xhtml.addElement(new link().setType(STYLESHEET_TYPE).setRel(STYLESHEET_REL)
        .setHref(CHAT_CLIENT_STYLES));

    // add client javascript ode
    xhtml.addElement(new script().setType(JAVASCRIPT_TYPE).setSrc(CHAT_CLIENT_DEPENDENCIES));
    xhtml.addElement(new script().setType(JAVASCRIPT_TYPE).setSrc(CHAT_CLIENT_MAIN));
    xhtml.addElement(new script().setType(JAVASCRIPT_TYPE).setSrc(CHAT_CLIENT_INIT));

    // retrieve connexion settings
    SettingBundle settings = ResourceLocator.getSettingBundle("org.silverpeas.chat.settings.chat");
    String httpBindUrl = settings.getString("chat.xmpp.httpBindUrl");
    String xmppDomain = settings.getString("chat.xmpp.xmppDomain");

    UserFull full = UserFull.getById(UserDetail.getCurrentRequester().getId());
    String userLogin = full.getLogin();
    String userPassword = full.getToken();

    // add connexion credentials
    xhtml.addElement("<script type='text/javascript'>"
        + "window.jsxcConnexionCredentials = {"
            + "userLogin: '" + userLogin + "', "
            + "userPassword: '" + userPassword + "', "
            + "httpBindUrl: '" + httpBindUrl + "', "
            + "xmppDomain: '" + xmppDomain + "', "
        + "}" +
        "</script>");

    return null;
  }

}

