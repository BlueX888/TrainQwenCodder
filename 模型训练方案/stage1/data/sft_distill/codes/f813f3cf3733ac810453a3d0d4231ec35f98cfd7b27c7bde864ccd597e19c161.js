// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  level: 1,
  score: 0,
  collected: 0,
  totalItems: 0,
  gameComplete: false,
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.itemsPerLevel = 5;
    this.maxLevel = 5;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
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
    // 初始化物理系统
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setDrag(500);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 50, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.itemsText = this.add.text(16, 84, `Items: 0/${this.itemsPerLevel}`, {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 生成当前关卡的收集物
    this.generateItems();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 更新全局信号
    this.updateSignals();

    // 记录关卡开始事件
    window.__signals__.events.push({
      type: 'level_start',
      level: this.level,
      timestamp: Date.now()
    });
  }

  generateItems() {
    // 清空现有物品
    this.items.clear(true, true);
    this.collectedCount = 0;

    // 使用固定种子生成位置（基于关卡数）
    const seed = this.level * 12345;
    let rng = seed;
    
    const random = () => {
      rng = (rng * 9301 + 49297) % 233280;
      return rng / 233280;
    };

    // 生成收集物
    for (let i = 0; i < this.itemsPerLevel; i++) {
      const x = 50 + random() * 700;
      const y = 50 + random() * 400;
      
      const item = this.items.create(x, y, 'item');
      item.setCircle(15);
      item.body.setAllowGravity(false);
      item.body.immovable = true;
    }

    this.itemsText.setText(`Items: 0/${this.itemsPerLevel}`);
    
    // 更新信号
    window.__signals__.totalItems = this.itemsPerLevel;
    window.__signals__.collected = 0;
  }

  collectItem(player, item) {
    // 销毁收集物
    item.destroy();
    
    // 更新分数
    this.collectedCount++;
    this.score += 10 * this.level; // 高关卡获得更多分数
    
    this.scoreText.setText(`Score: ${this.score}`);
    this.itemsText.setText(`Items: ${this.collectedCount}/${this.itemsPerLevel}`);

    // 记录收集事件
    window.__signals__.events.push({
      type: 'item_collected',
      level: this.level,
      score: this.score,
      collected: this.collectedCount,
      timestamp: Date.now()
    });

    // 更新信号
    this.updateSignals();

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.itemsPerLevel) {
      this.nextLevel();
    }
  }

  nextLevel() {
    this.level++;

    if (this.level > this.maxLevel) {
      // 游戏完成
      this.gameComplete();
      return;
    }

    // 更新UI
    this.levelText.setText(`Level: ${this.level}`);

    // 重置玩家位置
    this.player.setPosition(400, 500);
    this.player.setVelocity(0, 0);

    // 生成新关卡的物品
    this.generateItems();

    // 记录关卡完成事件
    window.__signals__.events.push({
      type: 'level_complete',
      level: this.level - 1,
      score: this.score,
      timestamp: Date.now()
    });

    // 记录新关卡开始
    window.__signals__.events.push({
      type: 'level_start',
      level: this.level,
      timestamp: Date.now()
    });

    // 更新信号
    this.updateSignals();
  }

  gameComplete() {
    // 显示完成信息
    const completeText = this.add.text(400, 300, 'GAME COMPLETE!', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });
    completeText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 360, `Final Score: ${this.score}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    finalScoreText.setOrigin(0.5);

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 更新完成信号
    window.__signals__.gameComplete = true;
    window.__signals__.events.push({
      type: 'game_complete',
      finalScore: this.score,
      timestamp: Date.now()
    });

    console.log('Game Complete! Final Score:', this.score);
    console.log('Signals:', JSON.stringify(window.__signals__, null, 2));
  }

  update() {
    if (this.physics.world.isPaused) {
      return;
    }

    // 玩家移动控制
    const speed = 300;

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

  updateSignals() {
    window.__signals__.level = this.level;
    window.__signals__.score = this.score;
    window.__signals__.collected = this.collectedCount;
    window.__signals__.totalItems = this.itemsPerLevel;
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
const game = new Phaser.Game(config);

// 输出初始状态日志
console.log('Game Started - Initial Signals:', JSON.stringify(window.__signals__, null, 2));