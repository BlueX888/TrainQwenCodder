// 全局信号记录
window.__signals__ = {
  level: 1,
  score: 0,
  collected: 0,
  totalLevels: 5,
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 5;
    this.score = 0;
    this.itemsPerLevel = 0;
    this.collectedThisLevel = 0;
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

    // 创建收集物纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    this.scoreText = this.add.text(16, 50, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 初始化第一关
    this.startLevel(1);

    // 记录初始信号
    this.logSignal('game_start', { level: 1, score: 0 });
  }

  startLevel(level) {
    this.currentLevel = level;
    this.collectedThisLevel = 0;
    this.itemsPerLevel = level * 3; // 每关物品数量递增

    // 清空现有物品
    this.items.clear(true, true);

    // 更新UI
    this.updateUI();

    // 生成收集物
    this.generateItems();

    // 显示关卡开始信息
    this.messageText.setText(`Level ${level} Start!`);
    this.time.delayedCall(1500, () => {
      this.messageText.setText('');
    });

    // 更新全局信号
    window.__signals__.level = level;
    this.logSignal('level_start', { 
      level: level, 
      itemsToCollect: this.itemsPerLevel 
    });
  }

  generateItems() {
    // 使用固定种子生成位置（基于关卡数）
    const seed = this.currentLevel * 1000;
    
    for (let i = 0; i < this.itemsPerLevel; i++) {
      // 伪随机位置生成（确定性）
      const x = 100 + ((seed + i * 137) % 600);
      const y = 100 + ((seed + i * 211) % 300);
      
      const item = this.items.create(x, y, 'item');
      item.setCircle(12); // 设置圆形碰撞体
    }
  }

  collectItem(player, item) {
    // 销毁收集物
    item.destroy();

    // 增加分数
    this.score += 10;
    this.collectedThisLevel++;

    // 更新UI
    this.updateUI();

    // 更新全局信号
    window.__signals__.score = this.score;
    window.__signals__.collected = this.collectedThisLevel;

    this.logSignal('item_collected', {
      score: this.score,
      collectedThisLevel: this.collectedThisLevel,
      remaining: this.itemsPerLevel - this.collectedThisLevel
    });

    // 检查是否收集完毕
    if (this.collectedThisLevel >= this.itemsPerLevel) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.currentLevel < this.totalLevels) {
      // 进入下一关
      this.messageText.setText(`Level ${this.currentLevel} Complete!`);
      
      this.logSignal('level_complete', {
        level: this.currentLevel,
        score: this.score
      });

      this.time.delayedCall(2000, () => {
        this.startLevel(this.currentLevel + 1);
      });
    } else {
      // 通关
      this.gameComplete();
    }
  }

  gameComplete() {
    this.messageText.setText(`All Levels Complete!\nFinal Score: ${this.score}`);
    this.messageText.setFontSize('28px');
    
    this.logSignal('game_complete', {
      finalScore: this.score,
      totalLevels: this.totalLevels
    });

    // 禁用玩家控制
    this.cursors = null;
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.totalLevels}`);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  update() {
    if (!this.cursors) return;

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

  logSignal(eventType, data) {
    const event = {
      timestamp: Date.now(),
      type: eventType,
      ...data
    };
    window.__signals__.events.push(event);
    console.log('[SIGNAL]', JSON.stringify(event));
  }
}

// Phaser 游戏配置
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
new Phaser.Game(config);