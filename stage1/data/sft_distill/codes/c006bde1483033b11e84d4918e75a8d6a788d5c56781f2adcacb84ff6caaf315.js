class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 10;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（绿色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0x00ff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建收集物品组
    this.items = this.physics.add.group();

    // 生成当前关卡的物品
    this.generateLevel();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

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

    this.itemsLeftText = this.add.text(16, 80, '', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    this.updateItemsLeftText();

    // 胜利信息文本（初始隐藏）
    this.winText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
  }

  generateLevel() {
    // 清空现有物品
    this.items.clear(true, true);

    // 根据关卡数量生成物品（关卡越高，物品越多）
    const itemCount = 3 + this.level;
    
    // 使用固定种子生成确定性位置
    const seed = this.level * 1000;
    
    for (let i = 0; i < itemCount; i++) {
      // 伪随机位置生成（确定性）
      const x = 100 + ((seed + i * 123) % 600);
      const y = 100 + ((seed + i * 456) % 400);
      
      const item = this.items.create(x, y, 'item');
      item.setCircle(12); // 设置圆形碰撞体
    }

    this.updateItemsLeftText();
  }

  collectItem(player, item) {
    // 销毁物品
    item.destroy();

    // 增加分数
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    this.updateItemsLeftText();

    // 检查是否收集完所有物品
    if (this.items.countActive(true) === 0) {
      this.advanceLevel();
    }
  }

  advanceLevel() {
    if (this.level < this.maxLevel) {
      // 进入下一关
      this.level++;
      this.levelText.setText(`Level: ${this.level}`);

      // 重置玩家位置
      this.player.setPosition(400, 300);
      this.player.setVelocity(0, 0);

      // 生成新关卡
      this.time.delayedCall(500, () => {
        this.generateLevel();
      });
    } else {
      // 游戏胜利
      this.showVictory();
    }
  }

  showVictory() {
    this.winText.setText(`Victory!\nFinal Score: ${this.score}`);
    this.winText.setVisible(true);
    
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 5秒后重新开始
    this.time.delayedCall(5000, () => {
      this.scene.restart();
      this.level = 1;
      this.score = 0;
    });
  }

  updateItemsLeftText() {
    const itemsLeft = this.items.countActive(true);
    this.itemsLeftText.setText(`Items Left: ${itemsLeft}`);
  }

  update() {
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

// 启动游戏
const game = new Phaser.Game(config);

// 导出状态用于验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}