class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 3;
    this.collectiblesPerLevel = 5;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      level: this.level,
      score: this.score,
      collected: 0,
      gameComplete: false
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（绿色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0x00ff00, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 生成当前关卡的收集物
    this.spawnCollectibles();

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
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.instructionText = this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 游戏完成提示文本（初始隐藏）
    this.completeText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    console.log('[GameStart]', JSON.stringify({
      level: this.level,
      score: this.score,
      collectibles: this.collectiblesPerLevel
    }));
  }

  spawnCollectibles() {
    // 清空现有收集物
    this.collectibles.clear(true, true);

    // 使用固定种子生成位置（基于关卡）
    const seed = this.level * 1000;
    const positions = [];

    // 生成不重叠的位置
    for (let i = 0; i < this.collectiblesPerLevel; i++) {
      let x, y, valid;
      let attempts = 0;
      
      do {
        valid = true;
        // 使用伪随机但可预测的位置
        x = 100 + ((seed + i * 137) % 600);
        y = 100 + ((seed + i * 211) % 400);
        
        // 检查是否与现有位置太近
        for (let pos of positions) {
          const dist = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
          if (dist < 80) {
            valid = false;
            break;
          }
        }
        
        attempts++;
      } while (!valid && attempts < 50);

      positions.push({ x, y });
      
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(12);
    }

    console.log('[LevelStart]', JSON.stringify({
      level: this.level,
      collectibles: this.collectiblesPerLevel,
      positions: positions
    }));
  }

  collectItem(player, collectible) {
    // 移除收集物
    collectible.destroy();

    // 增加分数
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 更新信号
    window.__signals__.score = this.score;
    window.__signals__.collected++;

    console.log('[ItemCollected]', JSON.stringify({
      level: this.level,
      score: this.score,
      remaining: this.collectibles.countActive()
    }));

    // 检查是否收集完当前关卡
    if (this.collectibles.countActive() === 0) {
      this.completeLevel();
    }
  }

  completeLevel() {
    console.log('[LevelComplete]', JSON.stringify({
      level: this.level,
      score: this.score
    }));

    // 检查是否完成所有关卡
    if (this.level >= this.maxLevel) {
      this.gameComplete();
      return;
    }

    // 进入下一关
    this.level++;
    this.levelText.setText(`Level: ${this.level}`);

    // 更新信号
    window.__signals__.level = this.level;
    window.__signals__.collected = 0;

    // 显示关卡完成提示
    this.completeText.setText(`Level ${this.level - 1} Complete!`);
    this.completeText.setVisible(true);

    // 延迟后生成新关卡
    this.time.delayedCall(1500, () => {
      this.completeText.setVisible(false);
      this.spawnCollectibles();
    });
  }

  gameComplete() {
    window.__signals__.gameComplete = true;

    console.log('[GameComplete]', JSON.stringify({
      finalLevel: this.level,
      finalScore: this.score,
      gameComplete: true
    }));

    // 显示游戏完成信息
    this.completeText.setText(`All Levels Complete!\nFinal Score: ${this.score}`);
    this.completeText.setVisible(true);

    // 禁用玩家控制
    this.player.setVelocity(0, 0);
    this.cursors = null;

    // 添加重启提示
    this.time.delayedCall(2000, () => {
      this.instructionText.setText('Press SPACE to Restart');
      
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.restart();
        this.level = 1;
        this.score = 0;
        window.__signals__ = {
          level: 1,
          score: 0,
          collected: 0,
          gameComplete: false
        };
      });
    });
  }

  update() {
    if (!this.cursors) return;

    const speed = 200;

    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制
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
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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