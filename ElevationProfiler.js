/////////////////////////////////////////////////////////////////////////////////////
///////////////////////////------ElevationProfiler.js------//////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
// 
// Version: 1.1
// Author: Joseph Rogan (joseph.rogan@forces.gc.ca canadajebus@gmail.com)
// 
// 
// This reusable widget allows the user to create a simple version of the ESRI 
// Elevation Profile widget, plus the drawing controls and events to fully utilize it.
// 
    // var elevationProfiler = null;
    
    // When the ElevationProfilerWindow is shown
    // on(buttonController, "showElevationProfilerWindow", function()
    // {
        // If the widget hasn't been built yet
        // if (elevationProfiler == null)
        // {
            // ElevationProfiler widget
            // elevationProfiler = new ElevationProfiler({
                // map: mainMap,
                // profileTaskUrl: url_elevation
                // }, "ElevationProfilerWindow");
            // elevationProfiler.startup();
            
            // When the ElevationProfilerWindow is hidden
            // on(buttonController, "hideElevationProfilerWindow", function()
            // {
                // elevationProfiler.hideResults();
            // });
            
        // }
        
        // Show the results window
        // elevationProfiler.showResults();
    // });
    
//
// Version 1.1
//  -Changed to remove graphic when the floating pane is hidden
// 
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

define([
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin", 
    
    "dojo/_base/declare",
    "dojo/_base/lang", 
    "dojo/on",
    "require",
    
    "esri/units", 
    
    "esri/dijit/ElevationProfile", 
    
    "esri/symbols/SimpleLineSymbol", 
    "esri/symbols/CartographicLineSymbol", 
    "esri/Color", 
    "esri/graphic", 
    "esri/toolbars/draw", 
    
    "dojox/layout/FloatingPane", 
    
    "dojo/text!./ElevationProfiler/templates/ElevationProfiler.html",
    
    "dojo/dom", 
    "dojo/dom-construct", 
    "dojo/domReady!"

], function(_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, 
    declare, lang, on, require, 
    Units, 
    ElevationProfile, 
    SimpleLineSymbol, CartographicLineSymbol, Color, Graphic, Draw, 
    FloatingPane, 
    dijitTemplate, dom, domConstruct)
{
    
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        
        // Set the template .html file
        templateString: dijitTemplate,
        
        // Path to the templates .css file
        css_path: require.toUrl("./ElevationProfiler/css/ElevationProfiler.css"),
        
        
        // The defaults
        defaults: {
            map: null,  
            profileTaskUrl: "", 
            theme: "elevationProfilerWidget"
        },
        
        
        // Vars
        elevationProfile: null, 
        elevationProfilerResultsFloatingPane: null, 
        elevationProfilerDraw: null, 
        elevationProfilerGraphic: null, 
        elevationProfilerLineSymbol: new CartographicLineSymbol(CartographicLineSymbol.STYLE_SOLID, new Color([255,0,0]), 2, CartographicLineSymbol.CAP_ROUND, CartographicLineSymbol.JOIN_MITER, 2),
        
        
        // Called when the widget is declared as new object
        constructor: function(options) {
            // Mix in the given options with the defaults
            var properties = lang.mixin({}, this.defaults, options);
            this.set(properties);
            
            this.css = {
                elevationProfilerTool: "elevationProfilerTool",
                elevationProfilerHelp: "elevationProfilerHelp"
                };
        },
        
        
        // Called after the widget is created
        postCreate: function() {
            this.inherited(arguments);
            
            // Set the button image sources
            this.elevationProfilerPolyline.src = require.toUrl("./ElevationProfiler/images/polyline.png");
            this.elevationProfilerFreehand_Polyline.src = require.toUrl("./ElevationProfiler/images/freehand_polyline.png");
            
            // Create the floating plane to hold the about info
            this.elevationProfilerResultsFloatingPane = new FloatingPane({
                title: "Elevation Profile Results",
                resizable: false, 
                dockable: false, 
                closable: false, 
                content: "<div style='margin: 5px;'>" + 
                        "<div id='ElevationProfileResultsDiv'></div>" + 
                        "<img id='ElevationProfileHelpPopup' src='" + require.toUrl("./ElevationProfiler/images/helpIcon.png") + "' title='Help'  style='position: absolute; float: left; left: 15px; bottom: 8px;' />" + 
                        "<div id='ElevationProfileHelpDiv' style='display: none; position: absolute; float: left; left: 40px; bottom: 20px;  border: solid 2px #333; border-radius: 3px; box-shadow: 3px 3px 3px #666; z-index: 20;'>" + 
                        "<img src='" + require.toUrl("./ElevationProfiler/images/elevationProfilerHelp.png") + "' style='width: 196px; height: 113px;' />" + 
                        "" + 
                        "" + 
                        "</div>" + 
                        "</div>",
                style: "left: -moz-calc(50% - 300px); left: -webkit-calc(50% - 300px); left: calc(50% - 300px); bottom: 8px; height: 200px; width: 600px; font-weight: normal;",
                id: "elevationProfileResultsFloatingPane",
                resize: function(dim){}
                }, dojo.create("div", { id: "elevationProfileResultsWindowDiv" }, dom.byId(this.map.id)) );
            
            this.elevationProfilerResultsFloatingPane.startup();
            
            
            // Wire events to show and hide the help info
            on(dom.byId("ElevationProfileHelpPopup"), "mouseover", function()
            {
                dom.byId("ElevationProfileHelpDiv").style.display = "block";
            });
            on(dom.byId("ElevationProfileHelpPopup"), "mouseout", function()
            {
                dom.byId("ElevationProfileHelpDiv").style.display = "none";
            });
            
        },
        
        
        // Called when the widget.startup() is used to view the widget
        startup: function() {
            this.inherited(arguments);
            
            // Create the esri elevation profile widget
            this.elevationProfile = new ElevationProfile({
                map: this.map,
                profileTaskUrl: this.profileTaskUrl,
                scalebarUnits: Units.KILOMETERS,
                chartOptions: { title: " ", titleFontColor: "#000", 
                        axisTitleFontSize: 8, 
                        axisFontColor: "#555", 
                        axisLabelFontSize: 7,
                        indicatorFontColor: "#000" }
                }, dom.byId("ElevationProfileResultsDiv"));
            this.elevationProfile.startup();
            // Bump it up a bit because the title has been removed
            this.elevationProfile.domNode.style.marginTop = "-30px";
            
        },
        
        
        // Hides the results floating pane
        hideResults: function() {
            // Disable the draw buttons
            this.elevationProfilerPolyline.className = "elevationProfilerTool";
            this.elevationProfilerFreehand_Polyline.className = "elevationProfilerTool";
            try
            {
                // Disable the draw object
                this.elevationProfilerDraw.deactivate();
                // Return to normal map navigation
                this.map.enableMapNavigation();
            } catch (err) {}
            
            //Clear profile
            this.elevationProfile.clearProfile();
            
            // Removes an existing graphic
            this.map.graphics.remove(this.elevationProfilerGraphic);
            
            // Hide the results window
            this.elevationProfilerResultsFloatingPane.hide();
        },
        
        // Shows the results floating pane
        showResults: function() {
            this.elevationProfilerResultsFloatingPane.show();
        },
        
        
        // When the draw polyline button is clicked
        _elevationProfilerPolylineClick: function() {
            this.elevationProfilerPolyline.className = "elevationProfilerToolSelected";
            this._initToolbar("polyline");
        },
        
        // When the draw freehand polyline button is clicked
        _elevationProfilerFreehand_PolylineClick: function() {
            this.elevationProfilerFreehand_Polyline.className = "elevationProfilerToolSelected";
            this._initToolbar("freehandpolyline");
        }, 
        
        
        // Starts the draw toolbar
        _initToolbar: function(toolName) {
            // Allow this. to be used in the events scope
            var _this = this;
            
            //Clear profile
            this.elevationProfile.clearProfile();
            
            // Removes an existing graphic
            this.map.graphics.remove(this.elevationProfilerGraphic);
            
            // New drawing object
            this.elevationProfilerDraw = new Draw(this.map);
            
            // Event for when the user is finished drawing
            this.elevationProfilerDraw.on("draw-end", function (evt, $_this) {
                // Disable the draw buttons
                _this.elevationProfilerPolyline.className = "elevationProfilerTool";
                _this.elevationProfilerFreehand_Polyline.className = "elevationProfilerTool";
                // Disable the draw object
                _this.elevationProfilerDraw.deactivate();
                // Return to normal map navigation
                _this.map.enableMapNavigation();
                
                // Create the graphic from the event geometry
                _this.elevationProfilerGraphic = new Graphic(evt.geometry, _this.elevationProfilerLineSymbol);
                _this.map.graphics.add(_this.elevationProfilerGraphic);
                _this.elevationProfile.set("profileGeometry", evt.geometry);
                });
                
            // Prepare to start drawing
            this.elevationProfilerDraw.activate(toolName);
            this.map.disableMapNavigation();
        }, 
        
        
        // When the unit select changes, update the elevation profile units
        _elevationProfilerUnitsSelect_Change: function(evt) {
            if (this.elevationProfile)
            {
                this.elevationProfile.set("measureUnits", evt.target.options[evt.target.selectedIndex].value);
            }
        }
        
        
    });

});