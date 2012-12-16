/*jslint nomen: true*/
/*global jaws, console, playState*/
var introState = {
    MAX_WIDTH: 500,
    MAX_HEIGHT: 500,
    backgrounds: null,
    boy: null,
    girl: null,
    playMovie: false,
    playMovie2: 0,

    setup: function () {
        "use strict";

        var self = this,
            anim = new jaws.Animation({sprite_sheet: "boy_ani.png", frame_size: [32, 64], frame_duration: 200}),
            bgAnim = new jaws.Animation({sprite_sheet: "background_ani.png", frame_size: [240, 240], frame_duration: 1000}),
            x_offset = 0,
            y_offset = 0,
            bg;
        
        jaws.on_keydown(["z"], function () {
            self.playMovie = true;
        });

        jaws.on_keydown(["x"], function () {
            jaws.switchGameState(playState);
        });

        this.backgrounds = new jaws.SpriteList();
        while (y_offset < this.MAX_HEIGHT) {
            while (x_offset < this.MAX_WIDTH) {
                bg = new jaws.Sprite({image: "background.png", x: x_offset, y: y_offset, anchor: "top_left"});
                bg.anim_default = bgAnim.slice(0, 2);
                bg.setImage(bg.anim_default.next());
                this.backgrounds.push(bg);
                x_offset += 240;
            }
            y_offset += 240;
            x_offset = 0;
        }
        
        this.boy = new jaws.Sprite({image: "boy.png", x: 230, y: 450, anchor: "top_left"});
        this.girl = new jaws.Sprite({image: "girl.png", x: 350, y: 450, anchor: "top_left"});
    },

    draw: function () {
        "use strict";

        this.backgrounds.draw();
        this.boy.draw();
        this.girl.draw();

        if (!this.playMovie) {
            jaws.context.font = "bold 20pt terminal";
            jaws.context.lineWidth = 10;
            jaws.context.fillStyle =  "white";
            jaws.context.strokeStyle =  "rgba(200,200,200,0.0)";
            jaws.context.fillText("Press z to see intro", 125, 100);
            jaws.context.fillText("Press x to start", 125, 150);
            jaws.context.font = "bold 10pt terminal";
            jaws.context.fillText("Why... I really love you...", 280, 420);
            jaws.context.fillText("you just broke my heart...", 280, 440);
        }

        if (this.playMovie2 >= 1) {
            jaws.context.fillText("What have I done?", 200, 440);
            
        }
    },

    update: function () {
        "use strict";
        this.backgrounds.forEach(function (bg, index) {
            bg.setImage(bg.anim_default.next());
        });

        if (this.playMovie) {
            this.girl.move(0, -2);

            if (this.girl.y <= 0 && this.playMovie2 === 0) {
                this.playMovie2 = 1;
            }
        }

        if (this.playMovie2 >= 1) {
            this.playMovie2 += 1;

            if (this.playMovie2 >= 180) {
                jaws.switchGameState(playState);
            }
        }

    }
};
