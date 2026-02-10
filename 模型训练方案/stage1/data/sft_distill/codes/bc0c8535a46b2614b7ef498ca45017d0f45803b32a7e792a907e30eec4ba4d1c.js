class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.itemsPerLevel = 5;
    this.collectedItems = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，不需要外部资源
  }

  create() {
    // 创建玩家纹理（紫色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x9b59b6, 1); // 紫色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建收集物品纹理（紫色圆圈）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xd8b5ff, 1); // 浅紫色
    itemGraphics.fillCircle(15, 15, 15);
    itemGraphics.generateTexture('item', 30, 30);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建收集物品组
    this.items = this.physics.add.group();

    // 生成当前关卡的物品
    this.generateItems();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#9b59b6',
      fontStyle: 'bold'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#9b59b6',
      fontStyle: 'bold'
    });

    this.itemsText = this.add.text(16, 80, `Items: ${this.collectedItems}/${this.itemsPerLevel}`, {
      fontSize: '24px',
      fill: '#9b59b6',
      fontStyle: 'bold'
    });

    // 添加背景色
    this.cameras.main.setBackgroundColor('#f0e6ff');

    // 游戏完成标志
    this.gameCompleted = false;
  }

  generateItems() {
    // 清空现有物品
    this.items.clear(true, true);
    this.collectedItems = 0;

    // 使用固定种子生成物品位置（确保确定性）
    const seed = this.level * 1000;
    const positions = [];

    // 根据关卡数增加物品数量
    const itemCount = this.itemsPerLevel + (this.level - 1) * 2;

    for (let i = 0; i < itemCount; i++) {
      let x, y;
      let attempts = 0;
      let validPosition = false;

      // 确保物品不重叠
      while (!validPosition && attempts < 50) {
        x = 50 + ((seed + i * 137) % 700);
        y = 50 + ((seed + i * 241) % 400);

        validPosition = true;
        for (let pos of positions) {
          const dist = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
          if (dist < 60) {
            validPosition = false;
            break;
          }
        }
        attempts++;
      }

      if (validPosition) {
        positions.push({ x, y });
        const item = this.items.create(x, y, 'item');
        item.body.setCircle(15);
        item.body.setAllowGravity(false);
        item.body.setImmovable(true);
      }
    }

    this.totalItems = this.items.getChildren().length;
    this.updateUI();
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.collectedItems++;
    this.score += 10 * this.level; // 关卡越高分数越多

    this.updateUI();

    // 检查是否收集完所有物品
    if (this.collectedItems >= this.totalItems) {
      this.nextLevel();
    }
  }

  nextLevel() {
    if (this.level >= 3) {
      // 游戏完成
      this.gameCompleted = true;
      this.showGameComplete();
    } else {
      // 进入下一关
      this.level++;
      this.time.delayedCall(500, () => {
        this.generateItems();
        this.player.setPosition(400, 500);
      });
    }
  }

  showGameComplete() {
    const completeText = this.add.text(400, 300, 'ALL LEVELS COMPLETE!', {
      fontSize: '48px',
      fill: '#9b59b6',
      fontStyle: 'bold'
    });
    completeText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 360, `Final Score: ${this.score}`, {
      fontSize: '32px',
      fill: '#9b59b6',
      fontStyle: 'bold'
    });
    finalScoreText.setOrigin(0.5);

    // 停止玩家移动
    this.player.body.setVelocity(0, 0);
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.level}`);
    this.scoreText.setText(`Score: ${this.score}`);
    this.itemsText.setText(`Items: ${this.collectedItems}/${this.totalItems}`);
  }

  update(time, delta) {
    if (this.gameCompleted) {
      return;
    }

    // 玩家移动控制
    const speed = 200;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.body.setVelocityY(speed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }
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

// 导出状态供验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}