/*global jaws*/
var playState = {
    player: null,
    backgrounds: null,
    bgOffsetY: 0,

    setup: function () {
        "use strict";
        var anim = new jaws.Animation({sprite_sheet: "boy_ani.png", frame_size: [32, 64], frame_duration: 200}),
            bgAnim = new jaws.Animation({sprite_sheet: "background_ani.png", frame_size: [240, 240], frame_duration: 1000}),
            x_offset = 0,
            y_offset = 0;

        this.backgrounds = new jaws.SpriteList();

        while (y_offset < 500) {
            while (x_offset < 500) {
                var bg = new jaws.Sprite({image: "background.png", x: x_offset, y: y_offset, anchor: "top_left"});
                bg.anim_default = bgAnim.slice(0, 2);
                bg.setImage(bg.anim_default.next());
                this.backgrounds.push(bg);
                x_offset += 240;
            }
            y_offset += 240;
            x_offset = 0;
        }

        this.player = new jaws.Sprite({x: jaws.width / 2, y: jaws.height / 2, anchor: "center"});
        this.player.anim_default = anim.slice(0, 2);
        this.player.setImage(this.player.anim_default.next());
        jaws.preventDefaultKeys(["up", "down", "left", "right"]);

        
    },

    update: function () {
        "use strict";
        this.player.setImage(this.player.anim_default.next());
        if (jaws.pressed("left")) { this.player.x -= 2; }
        if (jaws.pressed("right")) { this.player.x += 2; }

        this.bgOffsetY += 1;
        var state = this;
        this.backgrounds.forEach(function (bg, index) {
            bg.move(0, 1);
            bg.setImage(bg.anim_default.next());
        });

        if (state.bgOffsetY > 0) {
            var top = state.bgOffsetY - 240,
                x_offset = 0;
            while (x_offset < 500) {
                console.log("add a row");
                console.log(state.backgrounds.length);
                var bg = new jaws.Sprite({image: "background.png", x: x_offset, y: 0, anchor: "top_left"}),
                    bgAnim = new jaws.Animation({sprite_sheet: "background_ani.png", frame_size: [240, 240], frame_duration: 1000});
                bg.moveTo(bg.x, top);
                bg.anim_default = bgAnim.slice(0, 2);
                bg.setImage(bg.anim_default.next());
                state.backgrounds.push(bg);
                x_offset += 240;
            }
            state.bgOffsetY = top;
        }

        this.backgrounds.removeIf(function (bg) {
            if (bg.y > 500) {
                return true;
            }
            return false;
        });
    },

    draw: function () {
        "use strict";
        jaws.clear();
        this.backgrounds.draw();
        this.player.draw();
    }
}


