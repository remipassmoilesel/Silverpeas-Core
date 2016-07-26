/**
 * Created by remipassmoilesel on 26/07/16.
 */

/**
 * Silverpeas chat methods to be used on HMI.
 *
 * 
 *
 * @type {{_getJsxcRef: SilverpeasChat._getJsxcRef}}
 */
var SilverpeasChat = {

  /**
   * Enable / disbale verbose logging
   */
  debug: true,

  /**
   * Get the JSXC reference across possible several iframes
   * @returns {*}
   * @private
   */
  _getJsxcRef : function() {

    var winRef = window;
    var jsxcRef;
    while (typeof jsxcRef === "undefined" && typeof winRef !== "undefined") {

      jsxcRef = winRef.jsxc;
      winRef = window.parent;
    }

    if (typeof jsxcRef === "undefined") {
      throw "JSXC reference is not available";
    }

    return jsxcRef;
  },

  /**
   * Open a chat window with an user
   * @param silverpeasUserId
   */
  openChatWindow: function(silverpeasUserId){
    var self = SilverpeasChat;

    if(self.debug === true){
      console.log("openChatWindow");
      console.log(arguments);
    }

    self._getJsxcRef().api.Silverpeas.openChatWindowById(silverpeasUserId);
  }


};

