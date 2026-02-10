class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.collectiblesCount = 0;
    this.totalCollectibles = 0;
  }

  preload() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 生成收集物纹理（黄色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffff00, 1);
    collectibleGraphics.fillCircle(15, 15, 15);
    collectibleGraphics.generateTexture('collectible', 30, 30);
    collectibleGraphics.destroy();

    // 初始化signals
    window.__signals__ = {
      level: this.level,
      score: this.score,
      collected: 0,
      total: 0,
      events: []
    };
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建收集物组
    this.collectibles = this.physics.add.group();
    
    // 根据关卡生成收集物
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
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    this.scoreText = this.add.text(16, 50, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    this.collectText = this.add.text(16, 84, `Collected: ${this.collectiblesCount}/${this.totalCollectibles}`, {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });

    // 更新signals
    this.updateSignals();

    // 添加关卡提示
    const levelNotice = this.add.text(400, 300, `Level ${this.level}`, {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    levelNotice.setOrigin(0.5);

    // 提示文字淡出
    this.tweens.add({
      targets: levelNotice,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        levelNotice.destroy();
      }
    });
  }

  spawnCollectibles() {
    // 每关收集物数量：关卡 * 3
    this.totalCollectibles = this.level * 3;
    this.collectiblesCount = 0;

    // 使用固定种子生成位置（确保可重现）
    const seed = this.level * 1000;
    const positions = this.generatePositions(this.totalCollectibles, seed);

    positions.forEach(pos => {
      const collectible = this.collectibles.create(pos.x, pos.y, 'collectible');
      collectible.setCircle(15);
      collectible.body.setAllowGravity(false);
      collectible.body.immovable = true;
      
      // 添加浮动动画
      this.tweens.add({
        targets: collectible,
        y: collectible.y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  generatePositions(count, seed) {
    // 简单的伪随机数生成器（确保可重现）
    const random = (s) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const positions = [];
    const margin = 60;
    const minDistance = 80;

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, y;

      while (!validPosition && attempts < 50) {
        x = margin + random(seed + i * 2) * (800 - margin * 2);
        y = margin + random(seed + i * 2 + 1) * (400 - margin * 2);

        validPosition = true;
        
        // 检查与其他位置的距离
        for (let pos of positions) {
          const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
          if (dist < minDistance) {
            validPosition = false;
            break;
          }
        }

        attempts++;
      }

      if (validPosition) {
        positions.push({ x: Math.floor(x), y: Math.floor(y) });
      }
    }

    return positions;
  }

  collectItem(player, collectible) {
    // 收集物品
    collectible.destroy();
    this.collectiblesCount++;
    this.score += 10 * this.level; // 关卡越高分数越高

    // 更新UI
    this.scoreText.setText(`Score: ${this.score}`);
    this.collectText.setText(`Collected: ${this.collectiblesCount}/${this.totalCollectibles}`);

    // 更新signals
    this.updateSignals('collect');

    // 播放收集音效（视觉反馈）
    const flash = this.add.circle(collectible.x, collectible.y, 20, 0xffff00, 0.8);
    this.tweens.add({
      targets: flash,
      radius: 40,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });

    // 检查是否收集完所有物品
    if (this.collectiblesCount >= this.totalCollectibles) {
      this.nextLevel();
    }
  }

  nextLevel() {
    this.level++;

    // 更新signals
    this.updateSignals('levelComplete');

    // 检查是否通关
    if (this.level > 3) {
      this.showGameComplete();
      return;
    }

    // 显示过渡文字
    const transitionText = this.add.text(400, 300, `Level ${this.level}!`, {
      fontSize: '56px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 8
    });
    transitionText.setOrigin(0.5);

    // 延迟后重新开始场景
    this.time.delayedCall(1500, () => {
      this.scene.restart();
    });
  }

  showGameComplete() {
    // 显示游戏完成界面
    const bg = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    
    const completeText = this.add.text(400, 250, 'Game Complete!', {
      fontSize: '64px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 8
    });
    completeText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 350, `Final Score: ${this.score}`, {
      fontSize: '36px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    finalScoreText.setOrigin(0.5);

    // 更新最终signals
    window.__signals__.gameComplete = true;
    window.__signals__.finalScore = this.score;
    window.__signals__.events.push({
      type: 'gameComplete',
      timestamp: Date.now(),
      score: this.score
    });

    console.log('Game Complete! Final signals:', JSON.stringify(window.__signals__, null, 2));
  }

  updateSignals(eventType = null) {
    window.__signals__.level = this.level;
    window.__signals__.score = this.score;
    window.__signals__.collected = this.collectiblesCount;
    window.__signals__.total = this.totalCollectibles;

    if (eventType) {
      window.__signals__.events.push({
        type: eventType,
        timestamp: Date.now(),
        level: this.level,
        score: this.score,
        collected: this.collectiblesCount
      });
    }

    // 输出到控制台便于验证
    if (eventType === 'collect') {
      console.log(`Collected: ${this.collectiblesCount}/${this.totalCollectibles}, Score: ${this.score}`);
    } else if (eventType === 'levelComplete') {
      console.log(`Level ${this.level - 1} Complete! Moving to Level ${this.level}`);
    }
  }

  update() {
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