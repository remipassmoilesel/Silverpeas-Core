/**
 * Created by remipassmoilesel on 26/07/16.
 */

/**
 * Silverpeas chat methods to be used on HMI.
 *
 * These methods are only delegate methods to the Silverpeas JSXC module.
 *
 * @type {{_getJsxcRef: SilverpeasChat._getJsxcRef}}
 */
var SilverpeasChat = {
  
  /**
   * Enable / disbale verbose logging
   */
  debug: true,

  /**
   * Get the JSXC reference across possible several Iframes
   * @returns {*}
   * @private
   */
  _getJsxcRef : function() {

    // Look for jsxc across several eventual parents (for iframes)
    // We don't stop by checking the window parent existence
    // because of possible browser compatibility issues
    var maxTrys = 5;
    var winRef = window;
    var jsxcRef;
    for(var trys = 0; trys < maxTrys; trys ++){
      jsxcRef = winRef.jsxc;
      winRef = window.parent;

      if(typeof(jsxcRef) !== "undefined"){
        break;
      }
    }

    // throw if jsxc is not present
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

