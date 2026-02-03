class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 10;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffdd00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 28);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建 UI 文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 游戏完成提示文本（初始隐藏）
    this.completeText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false);

    // 生成第一关的物品
    this.spawnItems();
  }

  spawnItems() {
    // 清空现有物品
    this.items.clear(true, true);

    // 每关物品数量 = 关卡数 + 2
    const itemCount = this.level + 2;

    // 使用固定种子生成位置（确保可重现）
    const seed = this.level * 12345;
    const random = this.createSeededRandom(seed);

    for (let i = 0; i < itemCount; i++) {
      // 生成随机位置，避免边缘
      const x = 50 + random() * 700;
      const y = 100 + random() * 400;

      const item = this.items.create(x, y, 'item');
      item.body.setCircle(12);
      item.setData('value', 10); // 每个物品10分
    }
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();

    // 增加分数
    const value = item.getData('value');
    this.score += value;
    this.scoreText.setText(`Score: ${this.score}`);

    // 检查是否收集完本关所有物品
    if (this.items.countActive(true) === 0) {
      this.nextLevel();
    }
  }

  nextLevel() {
    this.level++;

    if (this.level > this.maxLevel) {
      // 游戏完成
      this.completeText.setText(`Game Complete!\nFinal Score: ${this.score}`);
      this.completeText.setVisible(true);
      this.player.setVelocity(0, 0);
      this.cursors = null; // 禁用输入
    } else {
      // 进入下一关
      this.levelText.setText(`Level: ${this.level}`);
      
      // 重置玩家位置
      this.player.setPosition(400, 300);
      this.player.setVelocity(0, 0);

      // 生成新关卡物品
      this.spawnItems();

      // 显示关卡提示
      const levelUpText = this.add.text(400, 200, `Level ${this.level}!`, {
        fontSize: '48px',
        fill: '#ffff00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      // 1秒后移除提示
      this.time.delayedCall(1000, () => {
        levelUpText.destroy();
      });
    }
  }

  update() {
    if (!this.cursors) return; // 游戏完成后不处理输入

    const speed = 200;

    // 重置速度
    this.player.setVelocity(0);

    // 处理键盘输入
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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }
  }

  // 创建可重现的随机数生成器
  createSeededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#333333',
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

// 导出状态供验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}