// 全局信号记录
window.__signals__ = {
  events: [],
  state: {
    level: 1,
    score: 0,
    itemsCollected: 0,
    totalItems: 0,
    gameComplete: false
  }
};

function logSignal(type, data) {
  const signal = { type, timestamp: Date.now(), ...data };
  window.__signals__.events.push(signal);
  console.log('[SIGNAL]', JSON.stringify(signal));
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.maxLevel = 15;
    this.score = 0;
    this.itemsPerLevel = 5; // 每关基础物品数
    this.itemsCollected = 0;
    this.totalItems = 0;
    this.player = null;
    this.items = null;
    this.cursors = null;
    this.levelText = null;
    this.scoreText = null;
    this.infoText = null;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    logSignal('PRELOAD_COMPLETE', {});
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(800);
    this.player.setMaxVelocity(300);

    // 创建物品组
    this.items = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // UI 文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.scoreText = this.add.text(16, 50, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.infoText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 开始第一关
    this.startLevel();

    logSignal('CREATE_COMPLETE', { level: this.level });
  }

  startLevel() {
    // 计算本关物品数量（随关卡递增）
    this.totalItems = this.itemsPerLevel + Math.floor((this.level - 1) * 1.5);
    this.itemsCollected = 0;

    // 清除旧物品
    this.items.clear(true, true);

    // 生成物品（使用固定种子保证确定性）
    const seed = this.level * 1000;
    const random = this.createSeededRandom(seed);

    for (let i = 0; i < this.totalItems; i++) {
      const x = 50 + random() * 700;
      const y = 50 + random() * 500;
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
    }

    // 更新 UI
    this.updateUI();

    // 显示关卡开始提示
    this.showLevelInfo(`Level ${this.level}`, 1000);

    // 更新全局状态
    window.__signals__.state.level = this.level;
    window.__signals__.state.totalItems = this.totalItems;
    window.__signals__.state.itemsCollected = 0;

    logSignal('LEVEL_START', {
      level: this.level,
      totalItems: this.totalItems,
      score: this.score
    });
  }

  collectItem(player, item) {
    item.destroy();
    this.itemsCollected++;
    this.score += 10 * this.level; // 分数随关卡递增

    // 更新全局状态
    window.__signals__.state.itemsCollected = this.itemsCollected;
    window.__signals__.state.score = this.score;

    this.updateUI();

    logSignal('ITEM_COLLECTED', {
      level: this.level,
      itemsCollected: this.itemsCollected,
      totalItems: this.totalItems,
      score: this.score
    });

    // 检查是否收集完所有物品
    if (this.itemsCollected >= this.totalItems) {
      this.completeLevel();
    }
  }

  completeLevel() {
    logSignal('LEVEL_COMPLETE', {
      level: this.level,
      score: this.score
    });

    if (this.level >= this.maxLevel) {
      // 通关所有关卡
      this.gameComplete();
    } else {
      // 进入下一关
      this.level++;
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });
      this.showLevelInfo('Level Complete!', 1000);
    }
  }

  gameComplete() {
    window.__signals__.state.gameComplete = true;

    logSignal('GAME_COMPLETE', {
      finalLevel: this.level,
      finalScore: this.score
    });

    this.showLevelInfo(`All Levels Complete!\nFinal Score: ${this.score}`, 0);
    this.player.setVelocity(0);
    this.cursors = null; // 禁用输入
  }

  showLevelInfo(text, duration) {
    this.infoText.setText(text);
    this.infoText.setVisible(true);

    if (duration > 0) {
      this.time.delayedCall(duration, () => {
        this.infoText.setVisible(false);
      });
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.level}/${this.maxLevel}`);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  update() {
    if (!this.cursors) return;

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

  // 创建确定性随机数生成器
  createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }
}

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

const game = new Phaser.Game(config);

// 导出游戏实例供测试
window.__game__ = game;