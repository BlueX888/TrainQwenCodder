class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 20;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（青色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00FFFF, 1); // 青色
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xFFFF00, 1); // 黄色
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setDrag(500);

    // 创建收集物品组
    this.items = this.physics.add.group();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#FFFFFF',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#FFFFFF',
      fontFamily: 'Arial'
    });

    this.itemsLeftText = this.add.text(16, 80, '', {
      fontSize: '20px',
      fill: '#FFFF00',
      fontFamily: 'Arial'
    });

    // 胜利文本（初始隐藏）
    this.winText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#00FF00',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false);

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 初始化关卡
    this.setupLevel();
  }

  setupLevel() {
    // 清空现有物品
    this.items.clear(true, true);

    // 根据关卡计算物品数量（每关增加2个，最少5个）
    const itemCount = 5 + (this.level - 1) * 2;

    // 使用固定种子生成物品位置（确保可重现）
    const seed = this.level * 12345;
    let random = this.seededRandom(seed);

    // 生成收集物品
    for (let i = 0; i < itemCount; i++) {
      const x = 50 + random() * 700;
      const y = 50 + random() * 500;
      const item = this.items.create(x, y, 'item');
      item.setCollideWorldBounds(true);
      item.setBounce(0);
    }

    // 更新UI
    this.levelText.setText(`Level: ${this.level}`);
    this.updateItemsLeftText();
  }

  // 简单的伪随机数生成器（确保确定性）
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  collectItem(player, item) {
    // 销毁物品
    item.destroy();

    // 增加分数（每个物品10分）
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 更新剩余物品文本
    this.updateItemsLeftText();

    // 检查是否收集完所有物品
    if (this.items.countActive(true) === 0) {
      this.nextLevel();
    }
  }

  updateItemsLeftText() {
    const itemsLeft = this.items.countActive(true);
    this.itemsLeftText.setText(`Items Left: ${itemsLeft}`);
  }

  nextLevel() {
    if (this.level >= this.maxLevel) {
      // 通关所有关卡
      this.winGame();
    } else {
      // 进入下一关
      this.level++;
      
      // 短暂延迟后设置新关卡
      this.time.delayedCall(500, () => {
        this.setupLevel();
      });
    }
  }

  winGame() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 显示胜利信息
    this.winText.setText(`YOU WIN!\nFinal Score: ${this.score}`);
    this.winText.setVisible(true);

    // 隐藏剩余物品文本
    this.itemsLeftText.setVisible(false);
  }

  update(time, delta) {
    // 如果游戏已结束，不处理输入
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

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态变量供验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}