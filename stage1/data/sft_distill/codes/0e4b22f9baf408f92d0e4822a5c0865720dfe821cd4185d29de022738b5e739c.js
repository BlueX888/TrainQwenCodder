class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.collectiblesCount = 0;
    this.totalCollectibles = 0;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（黄色圆形）
    const collectibleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    collectibleGraphics.fillStyle(0xffff00, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();
  }

  create() {
    // 初始化signals输出
    if (!window.__signals__) {
      window.__signals__ = [];
    }

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 根据关卡生成收集物
    this.generateCollectibles();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 50, `Score: ${this.score}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 输出初始状态
    this.emitSignal('level_start', {
      level: this.level,
      score: this.score,
      totalCollectibles: this.totalCollectibles
    });
  }

  generateCollectibles() {
    // 清空现有收集物
    this.collectibles.clear(true, true);

    // 根据关卡确定收集物数量
    const collectibleCounts = {
      1: 5,
      2: 8,
      3: 10
    };

    this.totalCollectibles = collectibleCounts[this.level] || 5;
    this.collectiblesCount = 0;

    // 使用固定种子生成位置（确保可重现）
    const seed = this.level * 1000;
    const positions = this.generatePositions(this.totalCollectibles, seed);

    // 创建收集物
    positions.forEach(pos => {
      const collectible = this.collectibles.create(pos.x, pos.y, 'collectible');
      collectible.setCircle(12);
      collectible.body.setAllowGravity(false);
      collectible.body.immovable = true;
    });
  }

  generatePositions(count, seed) {
    // 简单的伪随机数生成器（确保可重现）
    const random = (s) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const positions = [];
    for (let i = 0; i < count; i++) {
      const x = 100 + random(seed + i * 2) * 600; // 100-700范围
      const y = 100 + random(seed + i * 2 + 1) * 300; // 100-400范围
      positions.push({ x: Math.floor(x), y: Math.floor(y) });
    }
    return positions;
  }

  collectItem(player, collectible) {
    // 销毁收集物
    collectible.destroy();
    this.collectiblesCount++;

    // 增加分数
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 输出收集信号
    this.emitSignal('item_collected', {
      level: this.level,
      score: this.score,
      collected: this.collectiblesCount,
      remaining: this.totalCollectibles - this.collectiblesCount
    });

    // 检查是否收集完所有物品
    if (this.collectiblesCount >= this.totalCollectibles) {
      this.levelComplete();
    }
  }

  levelComplete() {
    this.emitSignal('level_complete', {
      level: this.level,
      score: this.score
    });

    // 进入下一关
    this.level++;

    if (this.level > 3) {
      // 游戏完成
      this.emitSignal('game_complete', {
        finalScore: this.score
      });
      
      this.add.text(400, 300, 'Game Complete!', {
        fontSize: '48px',
        color: '#00ff00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      this.add.text(400, 360, `Final Score: ${this.score}`, {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      // 停止游戏更新
      this.physics.pause();
    } else {
      // 延迟进入下一关
      this.time.delayedCall(500, () => {
        this.levelText.setText(`Level: ${this.level}`);
        this.generateCollectibles();
        this.player.setPosition(400, 500);
        
        this.emitSignal('level_start', {
          level: this.level,
          score: this.score,
          totalCollectibles: this.totalCollectibles
        });
      });
    }
  }

  update(time, delta) {
    // 键盘控制玩家移动
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

  emitSignal(eventType, data) {
    const signal = {
      timestamp: Date.now(),
      event: eventType,
      ...data
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