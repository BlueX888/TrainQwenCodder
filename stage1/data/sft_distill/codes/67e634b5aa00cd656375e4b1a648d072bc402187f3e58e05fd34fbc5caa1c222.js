class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 12;
    this.itemsPerLevel = 5;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物品纹理
    const itemGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    itemGraphics.fillStyle(0x00ff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 初始化随机数生成器
    this.rng = this.createSeededRandom(this.seed + this.level);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建收集物品组
    this.items = this.physics.add.group();
    this.spawnItems();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建 UI 文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.levelText.setDepth(100);

    this.scoreText = this.add.text(16, 50, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setDepth(100);

    this.itemsText = this.add.text(16, 84, `Items: ${this.items.getLength()}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.itemsText.setDepth(100);

    // 胜利文本（初始隐藏）
    this.winText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.winText.setOrigin(0.5);
    this.winText.setDepth(101);
    this.winText.setVisible(false);

    // 游戏状态
    this.gameWon = false;
  }

  update() {
    if (this.gameWon) {
      return;
    }

    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 更新 UI
    this.itemsText.setText(`Items: ${this.items.getLength()}`);
  }

  spawnItems() {
    const margin = 50;
    const width = this.scale.width;
    const height = this.scale.height;

    for (let i = 0; i < this.itemsPerLevel + this.level - 1; i++) {
      const x = margin + this.rng() * (width - 2 * margin);
      const y = margin + this.rng() * (height - 2 * margin);
      
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
      item.body.setSize(24, 24);
      item.body.setAllowGravity(false);
      item.body.setImmovable(true);
    }
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();

    // 增加分数
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 播放收集音效（使用简单的视觉反馈）
    const flash = this.add.graphics();
    flash.fillStyle(0x00ff00, 0.5);
    flash.fillCircle(item.x, item.y, 30);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // 检查是否收集完所有物品
    if (this.items.getLength() === 0) {
      this.nextLevel();
    }
  }

  nextLevel() {
    if (this.level >= this.maxLevel) {
      // 游戏胜利
      this.gameWon = true;
      this.winText.setText(`VICTORY!\nFinal Score: ${this.score}`);
      this.winText.setVisible(true);
      this.player.setVelocity(0);
      
      // 3秒后重新开始
      this.time.delayedCall(3000, () => {
        this.level = 1;
        this.score = 0;
        this.gameWon = false;
        this.scene.restart();
      });
    } else {
      // 进入下一关
      this.level++;
      this.levelText.setText(`Level: ${this.level}`);
      
      // 显示关卡过渡文本
      const levelUpText = this.add.text(400, 300, `Level ${this.level}!`, {
        fontSize: '64px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      });
      levelUpText.setOrigin(0.5);
      levelUpText.setDepth(101);

      // 淡出过渡文本并重新生成物品
      this.tweens.add({
        targets: levelUpText,
        alpha: 0,
        duration: 1000,
        delay: 500,
        onComplete: () => {
          levelUpText.destroy();
          this.rng = this.createSeededRandom(this.seed + this.level);
          this.spawnItems();
        }
      });

      // 重置玩家位置
      this.player.setPosition(400, 300);
      this.player.setVelocity(0);
    }
  }

  // 创建可重现的随机数生成器
  createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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

// 导出状态用于验证
game.getState = function() {
  const scene = game.scene.scenes[0];
  return {
    level: scene.level,
    score: scene.score,
    itemsRemaining: scene.items ? scene.items.getLength() : 0,
    gameWon: scene.gameWon
  };
};