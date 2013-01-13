/*jslint nomen: true*/
/*global jaws, console, gameOverState, goodEndingState, badEndingState*/
var playState = {
    player: null,
    backgrounds: null,
    blocks: null,
    bgOffsetY: 0,
    MAX_WIDTH: 500,
    MAX_HEIGHT: 500,
    VERTICAL_SPEED: 9,
    context_saved: false,
    tick: -300,
    translate: false,
    patternIndex: 0,
    patternSubIndex: 0,
    // Player Status
    hp: 50,
    time: 75,
    rage: 0,
    background_audio: null,

    dt: 0,

    init: function () {
        "use strict";

        this.player = null;
        this.backgrounds = null;
        this.blocks = null;
        this.bgOffsetY = 0;
        this.context_saved = false;
        this.tick = -300;
        this.translate = false;
        this.patternIndex = 0;
        this.patternSubIndex = 0;
        this.hp = 50;
        this.time = 75;
        this.rage = 0;
        this.background_audio = null;
        this.dt = 0;

        this.setup();
    },

    setup: function () {
        "use strict";
        var anim = new jaws.Animation({sprite_sheet: "boy_ani.png", frame_size: [32, 64], frame_duration: 200}),
            bgAnim = new jaws.Animation({sprite_sheet: "background_ani.png", frame_size: [240, 240], frame_duration: 1000}),
            x_offset = 0,
            y_offset = 0,
            bg;

        //BGM
        if (playsMP3()) {
            this.background_audio = jaws.assets.get("bgm.mp3");
            this.background_audio.play();
        } else {
            this.background_audio = jaws.assets.get("bgm.ogg");
            this.background_audio.play();
        }

        this.backgrounds = new jaws.SpriteList();
        this.blocks = new jaws.SpriteList();

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

        this.player = new jaws.Sprite({x: jaws.width / 2, y: jaws.height - 50, anchor: "center"});
        this.player.anim_default = anim.slice(0, 2);
        this.player.setImage(this.player.anim_default.next());
        this.player.boosting = false;

        jaws.preventDefaultKeys(["up", "down", "left", "right"]);
    },

    update: function () {
        "use strict";
        // Keyboard Handling
        if (jaws.pressed("left")) {
            this.player.x -= 12;
            if (this.player.x < 0) { this.player.x = 0; }
        }
        if (jaws.pressed("right")) {
            this.player.x += 12;
            if (this.player.x > 500) { this.player.x = 500; }
        }
        if (jaws.pressed("z")) {
            if (this.rage > 0) {
                this.translate = true;
                this.rage -= 1;
                this.player.boosting = true;
            } else {
                this.translate = false;
                this.player.boosting = false;
            }
        } else {
            this.translate = false;
            this.player.boosting = false;
        }

        this._updatePlayer();
        this._updateBackground();
        this._updateBlocks();
        this._updateTimer();

        if (this.tick > 22) {
            this._addBlockRow();
            this.tick = 0;
        } else {
            this.tick += 1;
        }

    },

    draw: function () {
        "use strict";
        jaws.clear();
        if (this.translate) {
            if (!this.context_saved) {
                jaws.context.save();
                this.context_saved = true;
            }
            jaws.context.translate(Math.random() * 6 - 3, Math.random() * 6 - 3);
        }

        // These sprites will be translated
        this.backgrounds.draw();
        this.blocks.draw();

        jaws.context.restore();

        // These sprites won't be translated
        this.player.draw();
        this._drawUI();

        if (this.translate) {
            jaws.context.save();
        } else {
            // If the translation is stopped, set the flag of context stack to false
            this.context_saved = false;
        }
    },

    _drawUI: function () {
        "use strict";

        var context = jaws.context;

        context.fillStyle = "white";
        context.font = "bold 20px Arial";
        context.fillText("LOVE: " + this.hp + "/100", 10, 20);
        context.fillText("RAGE: " + this.rage + "/100", 10, 45);
        context.fillText("TIME: " + this.time, 10, 70);

        if (this.tick < -100) {
            jaws.context.fillText("Find your (happy/sad) memories back", 85, 250);
        }
    },

    _updateTimer: function () {
        "use strict";

        var dt = jaws.game_loop.tick_duration;

        this.dt += dt;

        if (this.dt >= 1000) {
            this.time -= 1;
            this.dt = 0;
        }

        if (this.time <= 0) {
            this.ending();
        }
    },

    _updatePlayer: function () {
        "use strict";
        this.player.setImage(this.player.anim_default.next());

        if (this.player.boosting) {
            this.player.move(0, -2);
        } else {
            if (this.player.y < jaws.height - 50) {
                this.player.move(0, 2);
            }
        }
    },

    _updateBackground: function () {
        "use strict";
        var self = this, top, x_offset, bg, bgAnim;

        this.bgOffsetY += this.VERTICAL_SPEED;
        this.backgrounds.forEach(function (bg, index) {
            bg.move(0, self.VERTICAL_SPEED);
            bg.setImage(bg.anim_default.next());
        });

        if (this.bgOffsetY > 0) {
            top = this.bgOffsetY - 240;
            x_offset = 0;
            while (x_offset < this.MAX_WIDTH) {
                bg = new jaws.Sprite({image: "background.png", x: x_offset, y: 0, anchor: "top_left"});
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

        var left = 0, block, shouldAddSeparator, i, stillPatternToShow = true;

        // If there is still patterns to show
        if (this.patterns.length > this.patternIndex) {
            // If current pattern is completed, go to next pattern
            console.log(" patterns[i].length: " + this.patterns[this.patternIndex].length);
            if (this.patternSubIndex >= this.patterns[this.patternIndex].length) {
                this.patternIndex += 1;
                this.patternSubIndex = 0;
                shouldAddSeparator = true;
                console.log(" should add separator ");
            }
        } else {
            stillPatternToShow = false;
        }

        while (left < this.MAX_WIDTH) {
            if (shouldAddSeparator) {
                block = new jaws.Sprite({image: "good_block.png", x: left, y: -100, anchor: "top_left"});
                block.collided = false;
                block.type = "good";
                this.blocks.push(block);
                left += 100;
            } else {
                if (stillPatternToShow) {
                    for (i = 0; i < this.patterns[this.patternIndex][this.patternSubIndex].length; i += 1) {
                        if (this.patterns[this.patternIndex][this.patternSubIndex][i] === 1) {
                            block = new jaws.Sprite({image: "good_block.png", x: left, y: -100, anchor: "top_left"});
                            block.type = "good";
                        } else {
                            block = new jaws.Sprite({image: "bad_block.png", x: left, y: -100, anchor: "top_left"});
                            block.type = "bad";
                        }
                        block.collided = false;
                        this.blocks.push(block);
                        left += 100;
                    }
                    this.patternSubIndex += 1;
                } else {
                    break;
                }
            }
        }

    },

    _updateBlocks: function () {
        "use strict";

        var self = this;
        this.blocks.forEach(function (block, i) {
            block.move(0, self.VERTICAL_SPEED + 2);
            if (!block.collided) {
                if (block.y + 100 >= self.player.y && block.y + 100 < self.player.y + 64) {
                    if (block.x <= self.player.x && block.x + 100 >= self.player.x) {
                        console.log("collide!");
                        block.collided = true;

                        if (self.player.boosting) {
                            block.alpha = 0.5;
                        } else {
                            block.shouldRemove = true;
                            if (block.type === "good") {
                                if (self.hp < 100) {
                                    self.hp += 1;
                                }
                            } else {
                                self.hp -= 10;
                                if (self.hp < 0) {
                                    self.hp = 0;
                                }
                                self.rage += 10;

                                if (self.hp <= 0 || self.rage >= 100) {
                                    self.gameOver();
                                }
                            }
                        }
                    }
                }
            }
        });

        this.blocks.removeIf(function (block) {
            if (block.y > self.MAX_HEIGHT || block.shouldRemove) {
                return true;
            }
            return false;
        });
    },

    ending: function () {
        "use strict";
        if (this.rage < 10 && this.hp > 50) {
            jaws.switchGameState(goodEndingState);
        } else {
            jaws.switchGameState(badEndingState);
        }
    },

    gameOver: function () {
        "use strict";
        this.background_audio.pause();
        this.background_audio.currentTime = 0;
        jaws.switchGameState(gameOverState);
    },

    // Patterns!
    patterns: [[
        // 10 hourglass
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1]
    ], [
        // 10 lwave
        [1, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0]
    ], [
        // 10 l+wave
        [1, 0, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 1, 0],
        [1, 0, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 1, 0],
        [1, 0, 1, 0, 0],
        [1, 0, 0, 1, 0]
    ], [
        // 10 llong mini wave
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0]
    ], [
        // 10 rstraight
        [0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0]
    ], [
        // 10 mini wave
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0]
    ], [
        // 10 dual-mix-dual
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0]
    ], [
        // 11 noise
        [1, 0, 1, 0, 1],
        [0, 0, 1, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 1, 0, 1]
    ], [
        // 10 diamond
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0]
    ], [
        // 10 wave + l
        [0, 0, 1, 0, 1],
        [0, 1, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 0, 1],
        [0, 0, 1, 0, 1],
        [0, 1, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 0, 0, 1]
    ], [
        // 10 rlong mini wave
        [0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0]
    ], [
        // 10 sparse hourglass
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1]
    ], [
        // 10 shock
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1],
        [0, 0, 1, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 0, 0],
        [1, 0, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 0, 0, 1, 1]
    ], [
        // 10 rwave
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1]
    ]]

};

