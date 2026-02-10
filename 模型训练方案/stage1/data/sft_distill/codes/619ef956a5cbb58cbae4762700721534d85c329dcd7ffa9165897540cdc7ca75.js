class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 20;
    this.itemsPerLevel = 5;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 创建玩家纹理（青色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ffff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（黄色圆形）
    const itemGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建边界纹理（灰色）
    const wallGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    wallGraphics.fillStyle(0x666666, 1);
    wallGraphics.fillRect(0, 0, 32, 32);
    wallGraphics.generateTexture('wall', 32, 32);
    wallGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor(0x1a1a2e);

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#00ffff',
      fontStyle: 'bold'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffff00',
      fontStyle: 'bold'
    });

    this.infoText = this.add.text(400, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5, 0);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setDamping(true);
    this.player.setDrag(0.9);

    // 创建收集物品组
    this.items = this.physics.add.group();

    // 创建边界墙
    this.createWalls();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 开始第一关
    this.startLevel();
  }

  createWalls() {
    this.walls = this.physics.add.staticGroup();
    
    // 顶部墙
    for (let x = 0; x < 800; x += 32) {
      this.walls.create(x, 0, 'wall').setOrigin(0, 0).refreshBody();
    }
    
    // 底部墙
    for (let x = 0; x < 800; x += 32) {
      this.walls.create(x, 600 - 32, 'wall').setOrigin(0, 0).refreshBody();
    }
    
    // 左侧墙
    for (let y = 32; y < 600 - 32; y += 32) {
      this.walls.create(0, y, 'wall').setOrigin(0, 0).refreshBody();
    }
    
    // 右侧墙
    for (let y = 32; y < 600 - 32; y += 32) {
      this.walls.create(800 - 32, y, 'wall').setOrigin(0, 0).refreshBody();
    }

    this.physics.add.collider(this.player, this.walls);
  }

  startLevel() {
    // 清空旧物品
    this.items.clear(true, true);

    // 重置玩家位置
    this.player.setPosition(400, 300);
    this.player.setVelocity(0, 0);

    // 更新UI
    this.levelText.setText(`Level: ${this.level}`);
    this.infoText.setText(`Collect ${this.itemsPerLevel} items!`);

    // 计算每关物品数量（随关卡递增）
    const itemCount = this.itemsPerLevel + Math.floor(this.level / 4);

    // 使用固定种子生成物品位置
    const rng = this.createSeededRandom(this.seed + this.level);
    
    for (let i = 0; i < itemCount; i++) {
      let x, y, tooClose;
      let attempts = 0;
      
      do {
        x = rng() * (800 - 128) + 64;
        y = rng() * (600 - 128) + 64;
        tooClose = Phaser.Math.Distance.Between(x, y, 400, 300) < 100;
        attempts++;
      } while (tooClose && attempts < 50);

      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
      item.body.setAllowGravity(false);
      
      // 添加浮动动画
      this.tweens.add({
        targets: item,
        y: y - 10,
        duration: 1000 + rng() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  collectItem(player, item) {
    item.destroy();
    this.score += 10 * this.level;
    this.scoreText.setText(`Score: ${this.score}`);

    // 播放收集效果（闪烁）
    this.cameras.main.flash(100, 0, 255, 255, false);

    // 检查是否收集完所有物品
    if (this.items.countActive(true) === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    this.level++;

    if (this.level > this.maxLevel) {
      // 游戏胜利
      this.infoText.setText('🎉 ALL LEVELS COMPLETE! 🎉');
      this.infoText.setFontSize('32px');
      this.physics.pause();
      
      this.time.delayedCall(3000, () => {
        this.scene.restart();
        this.level = 1;
        this.score = 0;
      });
    } else {
      // 进入下一关
      this.infoText.setText('Level Complete!');
      this.cameras.main.flash(200, 0, 255, 0, false);
      
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });
    }
  }

  update(time, delta) {
    if (!this.player || !this.player.body) return;

    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  // 创建可预测的随机数生成器
  createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);