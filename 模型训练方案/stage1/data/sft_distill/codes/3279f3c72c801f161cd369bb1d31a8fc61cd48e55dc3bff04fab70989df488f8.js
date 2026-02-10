// 简单的可配置随机数生成器
class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  between(min, max) {
    return min + this.next() * (max - min);
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.itemsCollected = 0;
    this.totalItems = 0;
    this.rng = new SeededRandom(42);
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 初始化信号输出
    window.__signals__ = {
      level: this.level,
      score: this.score,
      itemsCollected: this.itemsCollected,
      totalItems: this.totalItems,
      gameComplete: false
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物品纹理（黄色圆圈）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();

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

    this.itemsText = this.add.text(16, 84, `Items: 0/0`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 开始第一关
    this.startLevel();

    // 日志输出
    console.log(JSON.stringify({
      action: 'game_start',
      level: this.level,
      score: this.score
    }));
  }

  startLevel() {
    // 清空现有物品
    this.items.clear(true, true);

    // 重置玩家位置
    this.player.setPosition(400, 300);
    this.player.setVelocity(0, 0);

    // 计算本关物品数量（随关卡递增）
    this.totalItems = 3 + this.level;
    this.itemsCollected = 0;

    // 生成物品（使用确定性随机位置）
    for (let i = 0; i < this.totalItems; i++) {
      const x = this.rng.between(50, 750);
      const y = this.rng.between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
    }

    // 更新 UI
    this.updateUI();

    // 更新信号
    this.updateSignals();

    // 日志输出
    console.log(JSON.stringify({
      action: 'level_start',
      level: this.level,
      totalItems: this.totalItems
    }));
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();

    // 更新统计
    this.itemsCollected++;
    this.score += 10 * this.level; // 分数随关卡递增

    // 更新 UI
    this.updateUI();

    // 更新信号
    this.updateSignals();

    // 日志输出
    console.log(JSON.stringify({
      action: 'item_collected',
      level: this.level,
      itemsCollected: this.itemsCollected,
      totalItems: this.totalItems,
      score: this.score
    }));

    // 检查是否收集完所有物品
    if (this.itemsCollected >= this.totalItems) {
      this.levelComplete();
    }
  }

  levelComplete() {
    console.log(JSON.stringify({
      action: 'level_complete',
      level: this.level,
      score: this.score
    }));

    // 检查是否完成所有关卡
    if (this.level >= 15) {
      this.gameComplete();
      return;
    }

    // 进入下一关
    this.level++;
    
    // 延迟开始下一关
    this.time.delayedCall(500, () => {
      this.startLevel();
    });
  }

  gameComplete() {
    // 显示完成信息
    const completeText = this.add.text(400, 300, 'ALL LEVELS COMPLETE!', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    completeText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 350, `Final Score: ${this.score}`, {
      fontSize: '28px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    });
    finalScoreText.setOrigin(0.5);

    // 更新信号
    window.__signals__.gameComplete = true;
    this.updateSignals();

    // 日志输出
    console.log(JSON.stringify({
      action: 'game_complete',
      finalLevel: this.level,
      finalScore: this.score
    }));

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.cursors = null;
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.level}`);
    this.scoreText.setText(`Score: ${this.score}`);
    this.itemsText.setText(`Items: ${this.itemsCollected}/${this.totalItems}`);
  }

  updateSignals() {
    window.__signals__.level = this.level;
    window.__signals__.score = this.score;
    window.__signals__.itemsCollected = this.itemsCollected;
    window.__signals__.totalItems = this.totalItems;
  }

  update(time, delta) {
    if (!this.cursors) return; // 游戏完成后停止更新

    // 玩家移动
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