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

    // 创建收集物纹理（青色圆圈）
    const itemGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    itemGraphics.fillStyle(0x00ffff, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setDamping(true);
    this.player.setDrag(0.9);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 创建 UI 文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#00ffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#00ffff',
      fontFamily: 'Arial'
    });

    this.itemsText = this.add.text(16, 80, '', {
      fontSize: '20px',
      fill: '#00ffff',
      fontFamily: 'Arial'
    });

    // 创建提示文本
    this.hintText = this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 生成当前关卡的物品
    this.generateLevel();
  }

  generateLevel() {
    // 清空现有物品
    this.items.clear(true, true);

    // 使用种子生成伪随机数
    const random = this.seededRandom(this.seed + this.level);

    // 生成物品数量随关卡递增
    const itemCount = this.itemsPerLevel + Math.floor((this.level - 1) / 2);

    for (let i = 0; i < itemCount; i++) {
      // 生成随机位置，避免边缘
      const x = 100 + random() * 600;
      const y = 150 + random() * 350;

      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
      item.setImmovable(true);
    }

    // 更新 UI
    this.updateUI();
  }

  seededRandom(seed) {
    // 简单的伪随机数生成器
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.score += 10 * this.level; // 分数随关卡递增

    // 播放简单的视觉反馈
    const flash = this.add.graphics();
    flash.fillStyle(0x00ffff, 0.5);
    flash.fillCircle(item.x, item.y, 30);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // 更新 UI
    this.updateUI();

    // 检查是否收集完所有物品
    if (this.items.countActive() === 0) {
      this.nextLevel();
    }
  }

  nextLevel() {
    this.level++;

    if (this.level > this.maxLevel) {
      // 游戏完成
      this.showGameComplete();
    } else {
      // 显示关卡过渡
      this.showLevelTransition();
    }
  }

  showLevelTransition() {
    // 创建过渡效果
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);
    overlay.setDepth(100);

    const text = this.add.text(400, 300, `Level ${this.level}`, {
      fontSize: '48px',
      fill: '#00ffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(101);

    // 淡入淡出效果
    this.tweens.add({
      targets: [overlay, text],
      alpha: 0,
      duration: 1500,
      delay: 500,
      onComplete: () => {
        overlay.destroy();
        text.destroy();
        this.generateLevel();
      }
    });
  }

  showGameComplete() {
    // 游戏完成界面
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, 800, 600);
    overlay.setDepth(100);

    const title = this.add.text(400, 250, 'GAME COMPLETE!', {
      fontSize: '48px',
      fill: '#00ffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(101);

    const finalScore = this.add.text(400, 320, `Final Score: ${this.score}`, {
      fontSize: '32px',
      fill: '#00ffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(101);

    const restartHint = this.add.text(400, 380, 'Refresh to Play Again', {
      fontSize: '20px',
      fill: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(101);

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.level}/${this.maxLevel}`);
    this.scoreText.setText(`Score: ${this.score}`);
    this.itemsText.setText(`Items: ${this.items.countActive()}`);
  }

  update(time, delta) {
    if (this.physics.world.isPaused) {
      return;
    }

    // 玩家移动控制
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
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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