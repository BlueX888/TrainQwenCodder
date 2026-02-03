class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 15;
    this.collectibles = null;
    this.player = null;
    this.levelText = null;
    this.scoreText = null;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
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
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      level: this.level,
      score: this.score,
      collectiblesRemaining: 0,
      gameComplete: false,
      collections: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);
    this.player.setMaxVelocity(300, 300);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 创建 UI 文本
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

    // 添加完成提示文本（初始隐藏）
    this.completeText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 生成当前关卡的收集物
    this.generateCollectibles();
  }

  generateCollectibles() {
    // 清空现有收集物
    this.collectibles.clear(true, true);

    // 每关生成的物品数量 = level + 2
    const itemCount = this.level + 2;
    
    // 使用种子生成伪随机位置
    const positions = this.generateRandomPositions(itemCount);

    positions.forEach(pos => {
      const collectible = this.collectibles.create(pos.x, pos.y, 'collectible');
      collectible.setCircle(12);
    });

    // 更新信号
    window.__signals__.collectiblesRemaining = itemCount;
    window.__signals__.level = this.level;
  }

  generateRandomPositions(count) {
    const positions = [];
    const margin = 50;
    const seed = this.seed + this.level * 1000;
    
    // 简单的伪随机数生成器
    let random = seed;
    const nextRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    for (let i = 0; i < count; i++) {
      const x = margin + nextRandom() * (this.cameras.main.width - margin * 2);
      const y = margin + nextRandom() * (this.cameras.main.height - margin * 2);
      positions.push({ x, y });
    }

    return positions;
  }

  collectItem(player, collectible) {
    // 销毁收集物
    collectible.destroy();

    // 增加分数
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 记录收集事件
    window.__signals__.collections.push({
      level: this.level,
      score: this.score,
      timestamp: Date.now()
    });

    // 更新剩余物品数
    const remaining = this.collectibles.getLength();
    window.__signals__.collectiblesRemaining = remaining;

    // 检查是否收集完所有物品
    if (remaining === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.level >= this.maxLevel) {
      // 游戏完成
      this.completeText.setText('GAME COMPLETE!');
      window.__signals__.gameComplete = true;
      
      // 停止玩家移动
      this.player.setVelocity(0, 0);
      this.physics.pause();
      
      console.log('Game Complete!', JSON.stringify(window.__signals__, null, 2));
    } else {
      // 进入下一关
      this.level++;
      this.levelText.setText(`Level: ${this.level}`);
      
      // 显示关卡完成提示
      this.completeText.setText(`Level ${this.level - 1} Complete!`);
      
      // 延迟后生成新关卡
      this.time.delayedCall(1000, () => {
        this.completeText.setText('');
        this.generateCollectibles();
      });

      console.log(`Level ${this.level - 1} Complete`, JSON.stringify({
        level: this.level,
        score: this.score
      }));
    }
  }

  update(time, delta) {
    if (this.physics.world.isPaused) {
      return;
    }

    // 玩家移动控制
    const acceleration = 500;

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }
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

new Phaser.Game(config);