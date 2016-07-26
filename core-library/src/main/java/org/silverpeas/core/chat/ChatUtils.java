package org.silverpeas.core.chat;

import org.apache.ecs.ElementContainer;
import org.apache.ecs.xhtml.link;
import org.apache.ecs.xhtml.script;
import org.apache.ecs.xhtml.var;
import org.silverpeas.core.admin.user.model.UserDetail;
import org.silverpeas.core.admin.user.model.UserFull;
import org.silverpeas.core.util.ResourceLocator;
import org.silverpeas.core.util.SettingBundle;
import org.silverpeas.core.util.URLUtil;
import org.silverpeas.core.util.logging.SilverLogger;

import static java.awt.SystemColor.window;
import static org.bouncycastle.asn1.x500.style.RFC4519Style.userPassword;
import static org.jsoup.nodes.Entities.EscapeMode.xhtml;
import static org.silverpeas.core.admin.user.model.SilverpeasRole.user;

/**
 * @author remipassmoilesel
 */
public class ChatUtils {

  private static SilverLogger logger = SilverLogger.getLogger("ChatUtils (static)");

  public static String CHAT_CLIENT_DIR = URLUtil.getApplicationURL() + "/chatclient/";
  public static String CHAT_CLIENT_STYLES = CHAT_CLIENT_DIR + "css/jsxc.css";
  public static String CHAT_CLIENT_DEPENDENCIES = CHAT_CLIENT_DIR + "lib/jsxc.dep.js";
  public static String CHAT_CLIENT_MAIN = CHAT_CLIENT_DIR + "jsxc.js";
  public static String CHAT_CLIENT_INIT = CHAT_CLIENT_DIR + "jsxc_init.js";

  private static final String JAVASCRIPT_TYPE = "text/javascript";
  private static final String STYLESHEET_TYPE = "text/css";
  private static final String STYLESHEET_REL = "stylesheet";

  /**
   * Add integration code to ElementContainer
   * @param xhtml
   * @return
   */
  public static final ElementContainer addClientIntegrationCode(final ElementContainer xhtml) {

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
    String userLogin = getNodeFromUser(full);
    String userPassword = full.getToken();
    String userDomainId = full.getDomainId();

    // add connexion credentials
    xhtml.addElement("\n<script type='text/javascript'>\n"
        + "window.jsxcConnexionCredentials = {\n"
            + "userLogin: '" + userLogin + "',\n "
            + "userPassword: '" + userPassword + "',\n "
            + "userDomainId: '" + userDomainId + "',\n "
            + "httpBindUrl: '" + httpBindUrl + "',\n "
            + "xmppDomain: '" + xmppDomain + "',\n "
            + "silverpeasContext: '" + URLUtil.getApplicationURL() + "',\n "
        + "}\n" +
        "</script>\n");

    return xhtml;
  }

  /**
   * Create a cross domain XMPP complete id from user and xmpp domain
   * @param user
   * @return
   */
  public static String getJidFromUser(final UserFull user, String xmppDomain) {
    return (getNodeFromUser(user) + "@" + xmppDomain).toLowerCase();
  }

  /**
   * Create a cross domain XMPP login from user
   * @param user
   * @return
   */
  public static String getNodeFromUser(final UserFull user) {
    return (user.getLogin() + "_id" + user.getId()).toLowerCase();
  }

}

