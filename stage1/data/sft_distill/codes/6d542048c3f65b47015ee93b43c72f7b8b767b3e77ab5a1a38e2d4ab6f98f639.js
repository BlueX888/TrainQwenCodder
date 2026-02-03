// 简单的种子随机数生成器
class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  range(min, max) {
    return min + this.next() * (max - min);
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 3;
    this.itemsPerLevel = 5;
    this.rng = new SeededRandom(42);
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建收集物纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(15, 15, 15);
    itemGraphics.generateTexture('item', 30, 30);
    itemGraphics.destroy();
  }

  create() {
    // 初始化信号系统
    if (!window.__signals__) {
      window.__signals__ = [];
    }
    
    this.emitSignal('game_start', { level: this.level, score: this.score });

    // 创建 UI 文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.scoreText = this.add.text(16, 50, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.items = this.physics.add.group();
    this.spawnItems();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 提示文本
    this.hintText = this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.hintText.setOrigin(0.5);
  }

  spawnItems() {
    const itemCount = this.itemsPerLevel + (this.level - 1) * 2; // 每关增加2个物品
    
    for (let i = 0; i < itemCount; i++) {
      const x = this.rng.range(50, 750);
      const y = this.rng.range(100, 400);
      
      const item = this.items.create(x, y, 'item');
      item.setCircle(15);
    }

    this.emitSignal('items_spawned', { 
      level: this.level, 
      itemCount: itemCount,
      totalItems: this.items.getChildren().length 
    });
  }

  collectItem(player, item) {
    item.destroy();
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    this.emitSignal('item_collected', { 
      score: this.score, 
      remaining: this.items.getChildren().length 
    });

    // 检查是否收集完所有物品
    if (this.items.getChildren().length === 0) {
      this.completeLevel();
    }
  }

  completeLevel() {
    this.emitSignal('level_complete', { 
      level: this.level, 
      score: this.score 
    });

    if (this.level < this.maxLevel) {
      // 进入下一关
      this.level++;
      this.time.delayedCall(500, () => {
        this.restartLevel();
      });

      // 显示关卡完成提示
      const completeText = this.add.text(400, 300, `Level ${this.level - 1} Complete!`, {
        fontSize: '32px',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      });
      completeText.setOrigin(0.5);
    } else {
      // 游戏完成
      this.gameComplete();
    }
  }

  restartLevel() {
    // 清除所有物品
    this.items.clear(true, true);

    // 重置玩家位置
    this.player.setPosition(400, 500);

    // 更新关卡文本
    this.levelText.setText(`Level: ${this.level}`);

    // 生成新关卡的物品
    this.spawnItems();

    this.emitSignal('level_start', { 
      level: this.level, 
      score: this.score 
    });
  }

  gameComplete() {
    this.emitSignal('game_complete', { 
      finalLevel: this.level, 
      finalScore: this.score 
    });

    // 显示游戏完成画面
    const completeText = this.add.text(400, 300, 'All Levels Complete!', {
      fontSize: '48px',
      fill: '#ffd700',
      backgroundColor: '#000000',
      padding: { x: 30, y: 15 }
    });
    completeText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 370, `Final Score: ${this.score}`, {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    finalScoreText.setOrigin(0.5);

    // 禁用玩家控制
    this.cursors = null;
  }

  update() {
    if (!this.cursors) return;

    const speed = 200;

    // 重置速度
    this.player.setVelocity(0);

    // 移动控制
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
  }

  emitSignal(event, data) {
    const signal = {
      timestamp: Date.now(),
      event: event,
      data: data
    };
    window.__signals__.push(signal);
    console.log('[SIGNAL]', JSON.stringify(signal));
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

// 导出游戏实例用于测试
if (typeof window !== 'undefined') {
  window.__game__ = game;
}