class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 10;
    this.itemsPerLevel = 5;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物品纹理（绿色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0x00ff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 创建收集物品组
    this.items = this.physics.add.group();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 50, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 16, '', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5, 0);

    // 生成第一关的物品
    this.generateItems();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 添加完成提示
    this.showLevelStart();
  }

  // 使用种子生成伪随机数
  seededRandom() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  generateItems() {
    // 清空现有物品
    this.items.clear(true, true);

    // 根据关卡增加物品数量
    const itemCount = this.itemsPerLevel + (this.level - 1);

    // 重置种子以保证每次相同关卡生成相同位置
    this.seed = 12345 + this.level * 1000;

    for (let i = 0; i < itemCount; i++) {
      const x = 100 + this.seededRandom() * 600;
      const y = 100 + this.seededRandom() * 400;
      
      const item = this.items.create(x, y, 'item');
      item.setCircle(12); // 设置圆形碰撞体
      item.body.setAllowGravity(false);
      item.setImmovable(true);
    }
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();

    // 增加分数
    this.score += 10 * this.level;
    this.scoreText.setText(`Score: ${this.score}`);

    // 检查是否收集完所有物品
    if (this.items.countActive(true) === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.level < this.maxLevel) {
      // 进入下一关
      this.level++;
      this.levelText.setText(`Level: ${this.level}`);
      
      // 重置玩家位置
      this.player.setPosition(400, 300);
      this.player.setVelocity(0, 0);

      // 生成新关卡的物品
      this.generateItems();

      // 显示关卡开始提示
      this.showLevelStart();
    } else {
      // 游戏完成
      this.gameComplete();
    }
  }

  showLevelStart() {
    this.statusText.setText(`Level ${this.level} Start! Collect ${this.items.countActive(true)} items!`);
    
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });
  }

  gameComplete() {
    this.statusText.setText('🎉 All Levels Complete! 🎉');
    this.statusText.setStyle({ fontSize: '32px', fill: '#00ff00' });
    
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 输出最终状态用于验证
    console.log('Game Complete!');
    console.log('Final Level:', this.level);
    console.log('Final Score:', this.score);
  }

  update(time, delta) {
    // 如果游戏已完成，不处理输入
    if (this.level > this.maxLevel) {
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

// 导出状态用于验证（可选）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    level: scene.level,
    score: scene.score,
    itemsRemaining: scene.items ? scene.items.countActive(true) : 0,
    maxLevel: scene.maxLevel
  };
};