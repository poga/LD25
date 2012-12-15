/*jslint nomen: true*/
/*global jaws, console*/
var playState = {
    player: null,
    backgrounds: null,
    blocks: null,
    bgOffsetY: 0,
    MAX_WIDTH: 500,
    MAX_HEIGHT: 500,
    VERTICAL_SPEED: 3,
    context_saved: false,
    tick: 0,

    setup: function () {
        "use strict";
        var anim = new jaws.Animation({sprite_sheet: "boy_ani.png", frame_size: [32, 64], frame_duration: 200}),
            bgAnim = new jaws.Animation({sprite_sheet: "background_ani.png", frame_size: [240, 240], frame_duration: 1000}),
            x_offset = 0,
            y_offset = 0;

        this.backgrounds = new jaws.SpriteList();
        this.blocks = new jaws.SpriteList();

        while (y_offset < this.MAX_HEIGHT) {
            while (x_offset < this.MAX_WIDTH) {
                var bg = new jaws.Sprite({image: "background.png", x: x_offset, y: y_offset, anchor: "top_left"});
                bg.anim_default = bgAnim.slice(0, 2);
                bg.setImage(bg.anim_default.next());
                this.backgrounds.push(bg);
                x_offset += 240;
            }
            y_offset += 240;
            x_offset = 0;
        }

        this.player = new jaws.Sprite({x: jaws.width / 2, y: jaws.height - 50, anchor: "center"});
        this.player.anim_default = anim.slice(0, 2);
        this.player.setImage(this.player.anim_default.next());
        this.player.boosting = false;

        jaws.preventDefaultKeys(["up", "down", "left", "right"]);

        this._addBlockRow();
    },

    update: function () {
        "use strict";
        // Keyboard Handling
        if (jaws.pressed("left")) { this.player.x -= 4; }
        if (jaws.pressed("right")) { this.player.x += 4; }
        if (jaws.pressed("z")) {
            if (!this.context_saved) {
                jaws.context.save();
                this.context_saved = true;
            }
            jaws.context.translate(Math.random() * 6 - 3, Math.random() * 6 - 3);
            this.player.boosting = true;
        } else {
            if (this.context_saved) {
                jaws.context.restore();
                this.context_saved = false;
            }
            this.player.boosting = false;
        }

        this._updatePlayer();
        this._updateBackground();
        this._updateBlocks();

        if (this.tick > 50) {
            this._addBlockRow();
            this.tick = 0;
        } else {
            this.tick += 1;
        }
    },

    draw: function () {
        "use strict";
        jaws.clear();
        this.backgrounds.draw();
        this.blocks.draw();
        this.player.draw();
    },

    _updatePlayer: function () {
        this.player.setImage(this.player.anim_default.next());

        if (this.player.boosting) {
            this.player.move(0,-2);
        } else {
            if (this.player.y < jaws.height - 50) {
                this.player.move(0, 2);
            }
        }
    },

    _updateBackground: function () {
        "use strict";
        var self = this;

        this.bgOffsetY += this.VERTICAL_SPEED;
        this.backgrounds.forEach(function (bg, index) {
            bg.move(0, self.VERTICAL_SPEED);
            bg.setImage(bg.anim_default.next());
        });

        if (this.bgOffsetY > 0) {
            var top = this.bgOffsetY - 240,
                x_offset = 0;
            while (x_offset < this.MAX_WIDTH) {
                var bg = new jaws.Sprite({image: "background.png", x: x_offset, y: 0, anchor: "top_left"}),
                    bgAnim = new jaws.Animation({sprite_sheet: "background_ani.png", frame_size: [240, 240], frame_duration: 1000});
                bg.moveTo(bg.x, top);
                bg.anim_default = bgAnim.slice(0, 2);
                bg.setImage(bg.anim_default.next());
                this.backgrounds.push(bg);
                x_offset += 240;
            }
            this.bgOffsetY = top;
        }

        this.backgrounds.removeIf(function (bg) {
            if (bg.y > self.MAX_HEIGHT) {
                return true;
            }
            return false;
        });
    },

    _addBlockRow: function () {
        "use strict";

        var left = 0;

        while (left < this.MAX_WIDTH) {
            if (Math.random() * 2 > 1) {
                var block = new jaws.Sprite({image: "good_block.png", x: left, y: -100, anchor: "top_left"});
            } else {
                var block = new jaws.Sprite({image: "bad_block.png", x: left, y: -100, anchor: "top_left"});
            }
            block.collided = false;
            this.blocks.push(block);
            left += 100;
        }
    },

    _updateBlocks: function () {
        "use strict";

        var self = this;
        this.blocks.forEach(function (block, i) {
            block.move(0, self.VERTICAL_SPEED);
            if (!block.collided) {
                if (block.y + 100 >= self.player.y) {
                    if (block.x <= self.player.x && block.x + 100 >= self.player.x) {
                        console.log("collide!");
                        block.collided = true;
                    }
                }
            }
        });


        this.blocks.removeIf(function (block) {
            if (block.y > self.MAX_HEIGHT) {
                return true;
            }
            return false;
        });

    }
}


