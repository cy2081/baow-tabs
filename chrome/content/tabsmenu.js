//
// JavaScript functions for Firefox Tabs Menu extension
// Mikel Ward <mikel@mikelward.com>
//

// Fake namespace
var tabsmenu = {
    changed:true,
    cur_idx:null,
    last_idx:null,
    last_idx2:null,

// Switch to a tab
selectTab: function(event)
{
  //window.alert("Selecting item");
  var target = event.target;
  if (target)
  {
    var index = target.getAttribute("value");
    if (index)
    {
      if (gBrowser)
      {
        var container = gBrowser.mTabContainer;
        if (container)
        {
          container.selectedIndex = index;


        //var tabs = gBrowser.mTabContainer.childNodes;

        //var tab = tabs[i];
        tabsmenu.cur_idx = index;
            if (tabsmenu.cur_idx != tabsmenu.last_idx)
            {
                tabsmenu.changed = true;
                tabsmenu.last_idx2 = tabsmenu.last_idx;
            }else{
                tabsmenu.changed = false;
            }

        }
        else
        {
          tabsmenu.logMessage("Cannot get tab container");
        }
      }
      else
      {
        tabsmenu.logMessage("Cannot get global browser");
      }
    }
    else
    {
      tabsmenu.logMessage("Cannot get tab index");
    }
  }
  else
  {
    tabsmenu.logMessage("Cannot get event target");
  }

},

// Create the tab menuitems for the current tabs and add them to the Tabs menu
createTabsMenu: function(aPopup)
{




  // Clear the menu before repopulating it
  tabsmenu.destroyTabsMenu(aPopup);

  // Get strings for the user's locale
  //window.alert("Getting strings");
  var tbstringbundle;
  if (gBrowser)
  {
    try
    {
      tbstringbundle = gBrowser.mStringBundle;
    }
    catch (e)
    {
      tabsmenu.logMessage("Cannot get strings");
    }
  }

  //window.alert("Creating menu");

  var menu = aPopup;
  if (menu)
  {
    if (tabsmenu.showActions())
    {
      // Add the separator to the empty menu
      var actionSeparator = document.createElement("menuseparator");
      if (actionSeparator)
      {
        menu.appendChild(actionSeparator);
        var newItem = document.createElement("menuitem");
        if (newItem)
        {
          newItem.setAttribute("label", "New Tab");
          newItem.setAttribute("key", "key_newNavigatorTab");
          newItem.setAttribute("command", "cmd_newNavigatorTab");
          newItem.setAttribute("accesskey", "n");
          menu.insertBefore(newItem, actionSeparator);
        }
        else
        {
          tabsmenu.logMessage("Cannot create New Tab item");
        }
        var closeItem = document.createElement("menuitem");
        if (closeItem)
        {
          closeItem.setAttribute("label", "Close Tab");
          closeItem.setAttribute("key", "key_close");
          closeItem.setAttribute("command", "cmd_close");
          closeItem.setAttribute("accesskey", "c");
          menu.insertBefore(closeItem, actionSeparator);
        }
        else
        {
          tabsmenu.logMessage("Cannot create Close Tab item");
        }
      }
      else
      {
        tabsmenu.logMessage("Cannot get menu separator");
      }
    }

    if (gBrowser)
    {
      if (gBrowser.mTabContainer)
      {
        var tabs = gBrowser.mTabContainer.childNodes;
        var l = tabs.length;

        var cur = gBrowser.mCurrentTab;


        for (var i = 0; i < tabs.length; i++)
        {
          var tab = tabs[i];
          if (tab)
          {
            var tabNumber = i + 1;
            var title = tab.getAttribute("label");

            var menuItem = document.createElement("menuitem");
            if (menuItem)
            {
              menuItem.setAttribute("id", "tabs-menu-tab" + i);
              menuItem.setAttribute("value", i);

              if (tabsmenu.showIcons())
              {
                menuItem.setAttribute("class", "menuitem-iconic");
                if (tab.hasAttribute("image"))
                {
                  var image = tab.getAttribute("image");
                  menuItem.setAttribute("image", image);
                }
                else
                {
                  try
                  {
                    var image = tabsmenu.getDefaultTabIcon();
                    menuItem.setAttribute("image", image);
                  }
                  catch (e)
                  {
                    tabsmenu.logMessage("Cannot get default tab icon");
                  }
                }
                menuItem.setAttribute("current", tab.getAttribute("selected"));
              }
              else
              {
                menuItem.setAttribute("class", "menuitem-radio");
                menuItem.setAttribute("type", "radio");
                menuItem.setAttribute("checked", tab.getAttribute("selected"));
              }

              if (tabsmenu.showShortcuts())
              {
                if (tab==cur){
                    menuItem.setAttribute("label", '>> '+ tabNumber + " - " + title);
                }else{
                    menuItem.setAttribute("label", '   ' + tabNumber + " - " + title);
                }

                // Only the first ten items in the list have keyboard shortcuts
                var accessKey = tabNumber % 10;
                if (tabNumber <= 10)
                {
                  menuItem.setAttribute("accesskey", accessKey);
                }
              }
              else
              {
                menuItem.setAttribute("label", title);
              }

              if (tab.hasAttribute("busy"))
              {
                var busy = tab.getAttribute("busy");
                menuItem.setAttribute("busy", busy);
              }

              menuItem.addEventListener("command", tabsmenu.selectTab, false);

              menu.appendChild(menuItem);
            }
            else
            {
              tabsmenu.logMessage("Cannot create menu item");
            }
            var un = tab.getAttribute("unread");
            if (un)
            {
               menuItem.setAttribute("style", "color:#EB7A00;");
            }

            if (tabsmenu.changed)
                   tab.setAttribute("last", "false");
            if (tabsmenu.last_idx2==i){
               tab.setAttribute("last", "true");
            }
            var last = tab.getAttribute("last");
            if (last=='true')
            {
               menuItem.setAttribute("style", "color:blue;");
            }

            if (tab==cur){
                   menuItem.setAttribute("style", "color:red;");
                    if (tabsmenu.changed)
                    {
                       tab.setAttribute("last", "true");
                       tabsmenu.last_idx = i;
                    }
                   //tab.setAttribute("cur", "true");
            }
          }
          else
          {
            tabsmenu.logMessage("Cannot get current browser");
          }
        }
        tabsmenu.changed = false;
      }
      else
      {
        tabsmenu.logMessage("Cannot get panel container");
      }
    }
    else
    {
      tabsmenu.logMessage("Cannot get global browser");
    }

    if (tabsmenu.showPreferences())
    {
      try
      {
        var prefsSeparator = document.createElement("menuseparator");
        if (prefsSeparator)
        {
          menu.appendChild(prefsSeparator);

          var prefsItem = document.createElement("menuitem");
          if (prefsItem)
          {
            var label;
            var stockPrefsItem = document.getElementById("menu_preferences");
            if (stockPrefsItem)
            {
              label = stockPrefsItem.getAttribute("label");
            }
            else
            {
              label = "Preferences";
            }
            prefsItem.setAttribute("label", label);
            prefsItem.addEventListener("command", tabsmenu.openPreferences, false);
            menu.appendChild(prefsItem);
          }
        }
      }
      catch (e)
      {
        tabsmenu.logMessage("Cannot create Preferences item");
      }
    }
  }
  else
  {
    tabsmenu.logMessage("Cannot get menu root");
  }
},

// Remove all tab menuitems from the Tabs menu
destroyTabsMenu: function(aPopup)
{
  //window.alert("Destroying menu");
  //var menu = document.getElementById("menu_TabsPopup");
  var menu = aPopup;
  if (menu)
  {
    var length = menu.childNodes.length;
    for (var i = length - 1; i >= 0; i--)
    {
      var tabNumber = i + 1;
      var node = menu.childNodes[i];
      try
      {
        menu.removeChild(node);
      }
      catch (e)
      {
        tabsmenu.logMessage("Failed to remove menu item " + tabNumber + ": " + label);
      }
    }
  }
  else
  {
    tabsmenu.logMessage("Cannot get menu root");
  }
},

// Print the names of all the tabs in the current window
dumpTabs: function()
{
  if (gBrowser)
  {
    if (gBrowser.mPanelContainer)
    {
      var l = gBrowser.mPanelContainer.childNodes.length;
      for (var i = 0; i < l; i++)
      {
        var browser = gBrowser.getBrowserAtIndex(i);
        var tabNumber = i + 1;
        var title = (browser.contentTitle) ? browser.contentTitle : "(Untitled)";
        tabsmenu.logMessage(tabNumber + ": " + title);
      }
    }
    else
    {
      tabsmenu.logMessage("Cannot get panel container");
    }
  }
  else
  {
    tabsmenu.logMessage("Cannot get global browser");
  }
},

// Get the location of the icon to show if a tab doesn't have its own.
getDefaultTabIcon: function()
{
  try
  {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefService)
                          .getBranch("extensions.tabsmenu.");
    return prefs.getCharPref("defaulttabicon");
  }
  catch (e)
  {
    Components.reportError(e);
    return false;
  }
},

// Send a message to the system log
logMessage: function(message)
{
  try
  {
    var log = Components.classes["@mozilla.org/consoleservice;1"]
                        .getService(Components.interfaces.nsIConsoleService);
    log.logStringMessage(message);
  }
  catch(e)
  {
    Components.reportError(e);
  }
},

// Check whether the user wants actions such as New Tab and
// Close Tab to appear in the drop-down list.
showActions: function()
{
  try
  {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefService)
                          .getBranch("extensions.tabsmenu.");
    return prefs.getBoolPref("showactions");
  }
  catch (e)
  {
    Components.reportError(e);
    return false;
  }
},

// Check whether the user wants to see each page's icon next to
// the title in the menu.  If not, we show a radio button.
showIcons: function()
{
  try
  {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefService)
                          .getBranch("extensions.tabsmenu.");
    return prefs.getBoolPref("showicons");
  }
  catch (e)
  {
    Components.reportError(e);
    return false;
  }
},

// Check whether the Preferences item should appear in the menu.
showPreferences: function()
{
  return false;

  /*
  // Show the Preferences in SeaMonkey only
  // This is because it doesn't yet have an easy way of changing
  // extension preferences, unlike Firefox
  const SEAMONKEY_ID = "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}";
      var nsIXULAppInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                                    .getService(Components.interfaces.nsIXULAppInfo);
      return (nsIXULAppInfo.ID == SEAMONKEY_ID);
  */
},

// Check whether the user wants the tab's title to be prefixed
// with a number indicating the keyboard shortcut to select that
// tab.
showShortcuts: function()
{
  try
  {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefService)
                          .getBranch("extensions.tabsmenu.");
    return prefs.getBoolPref("showshortcuts");
  }
  catch (e)
  {
    Components.reportError(e);
    return false;
  }
},

// Display the preferences dialog box.
openPreferences: function()
{
    window.openDialog("chrome://tabsmenu/content/tabsmenu-prefs.xul", "", "chrome,titlebar,toolbar,centerscreen,resizable,dialog=no");
},

    get: function(id){
        return document.getElementById(id);
    },

onKeyPress: function (event)                                           // {{{2
{

	var key = String.fromCharCode(event.charCode);
	if (event.ctrlKey && key=='m'){
      var pop = tabsmenu.get('tabs-menu3');

      pop.openPopupAtScreen(450, 200, false);

      tabsmenu.createTabsMenu(pop);
    }
},
onMouse: function (event)                                           // {{{2
{
    if (event.button==0) {
        //var key = String.fromCharCode(event.charCode);
        if (event.altKey){
              var pop = tabsmenu.get('tabs-menu3');

              pop.openPopupAtScreen(event.clientX-200, event.clientY-20, false);

              tabsmenu.createTabsMenu(pop);
        }
    }

    //if (event.button==1) {
      //var pop = tabsmenu.get('tabs-menu3');

      //pop.openPopupAtScreen(event.clientX-200, event.clientY-20, false);

      //tabsmenu.createTabsMenu(pop);
    //}
},

}

window.addEventListener("keypress", tabsmenu.onKeyPress,    true);
window.addEventListener("mousedown", tabsmenu.onMouse,    true);
//window.addEventListener("keydown",  tabsmenu.onKeyUpOrDown, true);
//window.addEventListener("keyup",    tabsmenu.onKeyUpOrDown, true);


