// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  level: 1,
  score: 0,
  collected: 0,
  totalItems: 0,
  gameCompleted: false,
  logs: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.itemsPerLevel = [5, 8, 12]; // 每关的收集物数量
    this.collected = 0;
    this.totalItems = 0;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4444ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建收集物纹理（绿色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0x00ff00, 1);
    itemGraphics.fillCircle(15, 15, 15);
    itemGraphics.generateTexture('item', 30, 30);
    itemGraphics.destroy();

    // 创建背景纹理（浅灰色）
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0xf0f0f0, 1);
    bgGraphics.fillRect(0, 0, 800, 600);
    bgGraphics.generateTexture('background', 800, 600);
    bgGraphics.destroy();
  }

  create() {
    // 添加背景
    this.add.image(400, 300, 'background');

    // 创建物理系统
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500);
    this.player.setMaxVelocity(300);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#000',
      fontStyle: 'bold'
    });

    this.scoreText = this.add.text(16, 50, '', {
      fontSize: '24px',
      fill: '#000',
      fontStyle: 'bold'
    });

    this.infoText = this.add.text(400, 100, '', {
      fontSize: '20px',
      fill: '#006600',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 初始化第一关
    this.startLevel(1);

    // 记录日志
    this.logSignal('Game started');
  }

  startLevel(level) {
    this.level = level;
    this.collected = 0;
    this.totalItems = this.itemsPerLevel[level - 1];

    // 清除旧的收集物
    this.items.clear(true, true);

    // 更新UI
    this.updateUI();
    this.infoText.setText(`Level ${level}\nCollect all ${this.totalItems} green items!`);

    // 生成收集物（使用固定种子确保可重复）
    const seed = level * 1000;
    for (let i = 0; i < this.totalItems; i++) {
      // 使用伪随机确保位置确定性
      const x = 100 + ((seed + i * 137) % 600);
      const y = 150 + ((seed + i * 211) % 400);
      
      const item = this.items.create(x, y, 'item');
      item.setCircle(15);
      item.body.setAllowGravity(false);
      item.setImmovable(true);
    }

    // 重置玩家位置
    this.player.setPosition(400, 300);
    this.player.setVelocity(0, 0);

    // 更新全局信号
    window.__signals__.level = this.level;
    window.__signals__.totalItems = this.totalItems;
    window.__signals__.collected = 0;

    this.logSignal(`Level ${level} started with ${this.totalItems} items`);
  }

  collectItem(player, item) {
    // 销毁收集物
    item.destroy();

    // 增加分数和收集数
    this.collected++;
    this.score += 10 * this.level; // 关卡越高分数越多

    // 更新UI
    this.updateUI();

    // 更新全局信号
    window.__signals__.collected = this.collected;
    window.__signals__.score = this.score;

    this.logSignal(`Item collected: ${this.collected}/${this.totalItems}, Score: ${this.score}`);

    // 检查是否收集完毕
    if (this.collected >= this.totalItems) {
      this.levelComplete();
    }
  }

  levelComplete() {
    this.logSignal(`Level ${this.level} completed!`);

    if (this.level < 3) {
      // 进入下一关
      this.time.delayedCall(1000, () => {
        this.startLevel(this.level + 1);
      });

      this.infoText.setText(`Level ${this.level} Complete!\nNext level in 1 second...`);
    } else {
      // 游戏完成
      this.gameComplete();
    }
  }

  gameComplete() {
    this.infoText.setText(`All Levels Complete!\nFinal Score: ${this.score}\nPress R to Restart`);
    
    window.__signals__.gameCompleted = true;
    this.logSignal(`Game completed! Final score: ${this.score}`);

    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.score = 0;
      window.__signals__.score = 0;
      window.__signals__.gameCompleted = false;
      this.logSignal('Game restarted');
      this.startLevel(1);
    });
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.level}/3`);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 300;

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(speed);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(speed);
    } else {
      this.player.setAccelerationY(0);
    }
  }

  logSignal(message) {
    const log = {
      timestamp: Date.now(),
      level: this.level,
      score: this.score,
      collected: this.collected,
      totalItems: this.totalItems,
      message: message
    };
    window.__signals__.logs.push(log);
    console.log('[SIGNAL]', JSON.stringify(log));
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
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