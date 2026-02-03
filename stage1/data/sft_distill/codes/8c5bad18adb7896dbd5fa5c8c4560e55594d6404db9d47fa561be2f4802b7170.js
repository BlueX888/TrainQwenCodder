// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  level: 1,
  score: 0,
  itemsCollected: 0,
  totalItems: 0,
  gameComplete: false,
  logs: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 3;
    this.itemsPerLevel = 5;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（绿色圆形）
    const itemGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    itemGraphics.fillStyle(0x2ecc71, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(0x95a5a6, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#ecf0f1');

    // 创建地面
    const ground = this.physics.add.staticSprite(400, 580, 'ground');
    ground.refreshBody();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 玩家与地面碰撞
    this.physics.add.collider(this.player, ground);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 初始化关卡
    this.setupLevel();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建 UI 文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#2c3e50',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#2c3e50',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });

    this.itemsText = this.add.text(16, 80, `Items: 0/${this.itemsPerLevel}`, {
      fontSize: '20px',
      fill: '#27ae60',
      fontFamily: 'Arial'
    });

    // 添加提示文本
    this.add.text(400, 16, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#7f8c8d',
      fontFamily: 'Arial'
    }).setOrigin(0.5, 0);

    // 初始化信号
    this.updateSignals();
    this.logEvent('Game Started');
  }

  setupLevel() {
    // 清空现有物品
    this.items.clear(true, true);

    // 根据关卡生成物品（使用固定种子保证可重现）
    const itemCount = this.itemsPerLevel + (this.level - 1) * 2; // 每关增加2个物品
    const seed = this.level * 1000; // 固定种子

    for (let i = 0; i < itemCount; i++) {
      // 使用伪随机但确定性的位置
      const x = 100 + (seed + i * 137) % 600; // 137 是质数，产生良好分布
      const y = 100 + (seed + i * 179) % 350; // 179 是质数

      const item = this.items.create(x, y, 'item');
      item.setBounce(0.5);
      item.setCollideWorldBounds(true);
      item.setVelocity(
        ((seed + i * 73) % 100) - 50,  // -50 到 50
        ((seed + i * 97) % 100) - 50
      );
    }

    // 更新 UI
    this.levelText.setText(`Level: ${this.level}`);
    this.itemsText.setText(`Items: 0/${itemCount}`);
    this.updateSignals();
    this.logEvent(`Level ${this.level} Started`, { itemCount });
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();

    // 增加分数（每关分数递增）
    const points = 10 * this.level;
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);

    // 更新物品计数
    const remaining = this.items.getChildren().length;
    const total = this.itemsPerLevel + (this.level - 1) * 2;
    const collected = total - remaining;
    this.itemsText.setText(`Items: ${collected}/${total}`);

    // 更新信号
    this.updateSignals();
    this.logEvent('Item Collected', { points, remaining, score: this.score });

    // 检查是否收集完所有物品
    if (remaining === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    this.logEvent(`Level ${this.level} Complete`, { score: this.score });

    if (this.level < this.maxLevel) {
      // 进入下一关
      this.level++;
      
      // 显示关卡完成提示
      const completeText = this.add.text(400, 300, `Level ${this.level - 1} Complete!`, {
        fontSize: '48px',
        fill: '#27ae60',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 2秒后开始下一关
      this.time.delayedCall(2000, () => {
        completeText.destroy();
        this.setupLevel();
      });
    } else {
      // 游戏完成
      this.gameComplete();
    }
  }

  gameComplete() {
    window.__signals__.gameComplete = true;
    this.logEvent('Game Complete', { finalScore: this.score });

    // 禁用输入
    this.cursors = null;

    // 显示游戏完成信息
    const completeText = this.add.text(400, 250, 'All Levels Complete!', {
      fontSize: '48px',
      fill: '#27ae60',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const finalScoreText = this.add.text(400, 320, `Final Score: ${this.score}`, {
      fontSize: '36px',
      fill: '#2c3e50',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const restartText = this.add.text(400, 380, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#7f8c8d',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 添加重启功能
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
      this.level = 1;
      this.score = 0;
      window.__signals__.gameComplete = false;
      window.__signals__.logs = [];
    });
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

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }

  updateSignals() {
    const remaining = this.items.getChildren().length;
    const total = this.itemsPerLevel + (this.level - 1) * 2;
    
    window.__signals__.level = this.level;
    window.__signals__.score = this.score;
    window.__signals__.itemsCollected = total - remaining;
    window.__signals__.totalItems = total;
  }

  logEvent(event, data = {}) {
    const logEntry = {
      timestamp: Date.now(),
      event: event,
      level: this.level,
      score: this.score,
      ...data
    };
    window.__signals__.logs.push(logEntry);
    console.log('[Game Event]', JSON.stringify(logEntry));
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#ecf0f1',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始信号状态
console.log('[Initial Signals]', JSON.stringify(window.__signals__, null, 2));