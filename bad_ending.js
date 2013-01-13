/*jslint nomen: true*/
/*global jaws, console, playState*/
var badEndingState = {
    MAX_WIDTH: 500,
    MAX_HEIGHT: 500,
    backgrounds: null,
    boy: null,

    setup: function () {
        "use strict";

        var self = this,
            anim = new jaws.Animation({sprite_sheet: "boy_ani.png", frame_size: [32, 64], frame_duration: 200}),
            bgAnim = new jaws.Animation({sprite_sheet: "background_ani.png", frame_size: [240, 240], frame_duration: 1000}),
            x_offset = 0,
            y_offset = 0,
            bg;
        
        jaws.on_keydown(["x"], function () {
            jaws.switchGameState(playState);
            playState.init();
        });

        this.backgrounds = new jaws.SpriteList();
        while (y_offset < this.MAX_HEIGHT) {
            while (x_offset < this.MAX_WIDTH) {
                bg = new jaws.Sprite({x: x_offset, y: y_offset, anchor: "top_left"});
                bg.anim_default = bgAnim.slice(0, 2);
                bg.setImage(bg.anim_default.next());
                this.backgrounds.push(bg);
                x_offset += 240;
            }
            y_offset += 240;
            x_offset = 0;
        }
        
        this.boy = new jaws.Sprite({image: "boy.png", x: 230, y: 450, anchor: "top_left"});
        this.boy = new jaws.Sprite({x: jaws.width / 2, y: jaws.height - 50, anchor: "center"});
        this.boy.anim_default = anim.slice(0, 2);
        this.boy.setImage(this.boy.anim_default.next());
    },

    draw: function () {
        "use strict";

        this.backgrounds.draw();
        this.boy.draw();

        jaws.context.font = "bold 20pt terminal";
        jaws.context.lineWidth = 10;
        jaws.context.fillStyle =  "white";
        jaws.context.strokeStyle =  "rgba(200,200,200,0.0)";
        jaws.context.fillText("Maybe we're both villains?", 75, 80);
        jaws.context.fillText("Press x to try again", 115, 130);
    },

    update: function () {
        "use strict";
        this.backgrounds.forEach(function (bg, index) {
            bg.setImage(bg.anim_default.next());
        });
        this.boy.setImage(this.boy.anim_default.next());
    }
};



