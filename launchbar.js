// jwebdesk-launchbar-taskbar
// jwebdesk-launchbar-mainmenu
// jwebdesk-launchbar-watch

define([
    "jwebkit",
    "jwebdesk",
], function(jwk, jwebdesk) {

    //  --------------------------------------------------------------------------
    jwebdesk.Hud.LaunchBar = function (settings) {        
        if (!settings) return;
        var def = {
            ui_type: "launchbar",
            namespace: "jwebdesk",
            layout: ["content"]
        };
        var launchbar = this;
        
        window.launchbar = launchbar;
        
        settings = jwk.extend(def, settings);
        jwebdesk.Hud.call(this, settings);
        
        /// -------------------------------
        /// HACK: mientras no esté hecho el pasaje de HUD a APP (o sea que corra en su propio iFrame)
        /// estarán conviniendo en el top frame el jwebdesk y el launchbar.
        /// El jwebdesk está bien pero el otro no debería estar así que le metemos un hack temporal
        this.id = "jwebdesk~jwebdesk-launchbar@alpha-0.5";
        /// -------------------------------
        
        // -------------------------------
        // HACK: para separar el jwk del jwk.ui
        var c = new jwk.ui.Component();
        for (var i in c) {
            if (typeof c[i] == "function" && typeof this[i] == "undefined") {
                this[i] = c[i];                
            }
        }
        jwk.ui.Component.call(this, settings);
        // -------------------------------
        
        
        this.set("layout", settings.layout, {no_parse:true});    
        // this.set("tasks", []);
        this.set("comp", new jwk.Node());
        var timer;
        this.get("comp").on("change", function () {
            if (timer) clearTimeout(timer);
            timer = setTimeout(function(){
                // console.log("launchbar.paint();");
                launchbar.paint();
                timer = null;
            }, 250);
        });
                
        this.on("render_start", function (n,e) { 
            e.component.restructure();
        });
    }
    
    jwebdesk.Hud.LaunchBar.prototype = new jwebdesk.Hud();
    jwebdesk.Hud.LaunchBar.prototype.constructor = jwebdesk.Hud.LaunchBar;
    

    jwebdesk.Hud.LaunchBar.prototype.add_plugin = function () {
        console.log("add_plugin", arguments);
    }
    
    
    jwebdesk.Hud.LaunchBar.prototype.create_proxy = function () {
        var proxy = jwk.global.proxy();
        
        proxy.register_function({
            add_component: this.add_component,
            add_plugin: this.add_plugin,
            hide: this.hide,
            show: this.show
        })
        
        return proxy;
    }
    
    jwebdesk.Hud.LaunchBar.prototype.add_component = function (nombre, json_tree) {
        var deferred = jwk.Deferred();
        deferred.nombre = nombre;
        this.one("change:structure", function (n,e){
            var structure = e.value;            
            // console.error('->this.one("change:structure")', 'structure.search('+nombre+')', deferred.nombre, structure.search(nombre));
            deferred.resolve(structure.search(nombre));
        }, nombre);
        this.comp.set(nombre, json_tree);
        return deferred.promise();
    }
    
    jwebdesk.Hud.LaunchBar.prototype.adjust_size = function (nombre, size) {
        var deferred = jwk.Deferred();
        var structure = this.search("structure");
        console.assert(structure, "ERROR: structure not found", [this]);
        var comp = structure.search(nombre);
        console.assert(comp, "ERROR: component " + nombre +" not found", [structure]);
        var target = comp.target;
        console.assert(target, "ERROR: component has no target. Must render first", [comp]);
        
        var w = size || target.outerWidth();
        target.closest("[cell="+nombre+"]").width(w);
        
        return deferred.resolve().promise();
    }
    
    jwebdesk.Hud.LaunchBar.prototype.register_function = function (name, func) {
        // console.error("??????????????????????????????????????");
        // TODO hay que actualizar esto y volverlo todo proxy
        jwebdesk.Hud.LaunchBar.prototype[name] = func;
    }
    
    jwebdesk.Hud.LaunchBar.prototype.structure_tree = function () {
        
        var config_layout;
        var layout = [];
        // console.log("-------->", "jwebdesk~jwebdesk-launchbar");
        jwebdesk.require(this.id).done(function (setup) {
            config_layout = setup.config.layout.valueOf();
            // console.log("-------->", config_layout);
        }) 
              
        var obj = {
            "data": this,
            "ui_type": "panel.placeholder",
            "namespace": "jwk-ui",
            "name":"structure",
            "children": {
                "bar": {                    
                    "class": "expand",
                    "ui_type": "panel.layout",
                    "layout": layout,
                    "children": {
                    }                
                }
            }
        }        
        

        var list = this.comp.each(function (json, name) {
            obj.children.bar.children[name] = json;
            layout[config_layout.indexOf(name)] = name;
        });

        return obj;
    }
    
    jwebdesk.Hud.LaunchBar.prototype.hide = function (name) {
        console.error("ERROR: not jwebdesk.Hud.LaunchBar.hide(name) not implemented yet");
    }
    jwebdesk.Hud.LaunchBar.prototype.show = function (name) {
        console.error("ERROR: not jwebdesk.Hud.LaunchBar.show(name) not implemented yet");
    }
    jwebdesk.Hud.LaunchBar.prototype.parent_for = function (name, index) {
        switch (name) {
            case "structure":
            case "bar":
                return {parent:this};
            default:
                console.log(name, index);
        }
        return {parent:this.get("structure"), query:".content"};    
    }
    
    jwk.ui.component({
        ui_type: "launchbar",
        namespace: "jwebdesk",
        constructor: jwebdesk.Hud.LaunchBar
    });
    
    return jwebdesk.Hud.LaunchBar;
  
});
    

    