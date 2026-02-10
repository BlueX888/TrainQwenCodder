// 全局信号存储
window.__signals__ = {
  level: 1,
  score: 0,
  collected: 0,
  totalCollectibles: 0,
  gameComplete: false,
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 5;
    this.collectiblesPerLevel = 5;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（黄色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffff00, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 创建UI文本
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

    this.instructionText = this.add.text(400, 500, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
    this.instructionText.setOrigin(0.5);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 初始化关卡
    this.initLevel();

    // 记录初始状态
    this.logEvent('game_start', { level: this.level, score: this.score });
  }

  initLevel() {
    // 清空现有收集物
    this.collectibles.clear(true, true);

    // 使用固定种子生成收集物位置
    const positions = this.generateCollectiblePositions();

    // 创建收集物
    positions.forEach((pos, index) => {
      const collectible = this.collectibles.create(pos.x, pos.y, 'collectible');
      collectible.body.setCircle(12);
      collectible.body.setOffset(0, 0);
      collectible.setData('id', index);
    });

    // 更新UI
    this.levelText.setText(`Level: ${this.level}`);
    this.scoreText.setText(`Score: ${this.score}`);

    // 更新信号
    this.updateSignals();

    // 记录关卡开始
    this.logEvent('level_start', {
      level: this.level,
      collectibles: this.collectiblesPerLevel
    });
  }

  generateCollectiblePositions() {
    const positions = [];
    const rng = this.createSeededRandom(this.seed + this.level);

    for (let i = 0; i < this.collectiblesPerLevel; i++) {
      // 生成不重叠的位置
      let x, y, valid;
      let attempts = 0;
      
      do {
        valid = true;
        x = 50 + rng() * 700;
        y = 100 + rng() * 400;
        
        // 检查与玩家初始位置的距离
        if (Math.abs(x - 400) < 60 && Math.abs(y - 300) < 60) {
          valid = false;
        }
        
        // 检查与其他收集物的距离
        for (let pos of positions) {
          const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
          if (dist < 50) {
            valid = false;
            break;
          }
        }
        
        attempts++;
      } while (!valid && attempts < 100);
      
      positions.push({ x: Math.floor(x), y: Math.floor(y) });
    }

    return positions;
  }

  createSeededRandom(seed) {
    // 简单的伪随机数生成器
    let s = seed;
    return function() {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  collectItem(player, collectible) {
    // 销毁收集物
    collectible.destroy();

    // 增加分数
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 记录收集事件
    this.logEvent('collect_item', {
      level: this.level,
      score: this.score,
      remaining: this.collectibles.getLength()
    });

    // 检查是否收集完所有物品
    if (this.collectibles.getLength() === 0) {
      this.completeLevel();
    }

    // 更新信号
    this.updateSignals();
  }

  completeLevel() {
    // 记录关卡完成
    this.logEvent('level_complete', {
      level: this.level,
      score: this.score
    });

    // 进入下一关
    this.level++;

    if (this.level > this.maxLevel) {
      // 游戏完成
      this.gameComplete();
    } else {
      // 延迟进入下一关
      this.time.delayedCall(500, () => {
        this.initLevel();
      });
    }
  }

  gameComplete() {
    // 显示完成信息
    const completeText = this.add.text(400, 300, 'Game Complete!', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    completeText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 360, `Final Score: ${this.score}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    finalScoreText.setOrigin(0.5);

    // 记录游戏完成
    this.logEvent('game_complete', {
      finalScore: this.score,
      levelsCompleted: this.maxLevel
    });

    // 更新信号
    window.__signals__.gameComplete = true;
    this.updateSignals();
  }

  update() {
    if (this.level > this.maxLevel) {
      return; // 游戏已完成
    }

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

  updateSignals() {
    window.__signals__.level = this.level;
    window.__signals__.score = this.score;
    window.__signals__.collected = this.collectiblesPerLevel - this.collectibles.getLength();
    window.__signals__.totalCollectibles = this.collectiblesPerLevel;
  }

  logEvent(eventType, data) {
    const event = {
      timestamp: Date.now(),
      type: eventType,
      data: data
    };
    window.__signals__.events.push(event);
    console.log('[EVENT]', JSON.stringify(event));
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