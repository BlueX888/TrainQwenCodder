class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0;
    this.totalHexagons = 12;
    this.gameCompleted = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建六边形纹理（黄色六边形）
    const hexGraphics = this.add.graphics();
    hexGraphics.fillStyle(0xf1c40f, 1);
    hexGraphics.lineStyle(2, 0xe67e22, 1);
    
    // 绘制六边形
    const hexRadius = 20;
    const hexPath = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = hexRadius + Math.cos(angle) * hexRadius;
      const y = hexRadius + Math.sin(angle) * hexRadius;
      hexPath.push(new Phaser.Math.Vector2(x, y));
    }
    hexGraphics.fillPoints(hexPath, true);
    hexGraphics.strokePoints(hexPath, true);
    hexGraphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
    hexGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500, 500);
    this.player.setMaxVelocity(300, 300);

    // 创建六边形收集物组
    this.hexagons = this.physics.add.group();
    
    // 随机分布12个六边形
    const positions = this.generateRandomPositions(this.totalHexagons);
    positions.forEach(pos => {
      const hex = this.hexagons.create(pos.x, pos.y, 'hexagon');
      hex.setCircle(20); // 使用圆形碰撞体积
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.hexagons,
      this.collectHexagon,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, '已收集: 0/12', {
      fontSize: '24px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(400, 550, '使用方向键或WASD移动，收集所有六边形', {
      fontSize: '18px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5);

    // 通关文本（初始隐藏）
    this.victoryText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '64px',
      fill: '#f1c40f',
      stroke: '#000',
      strokeThickness: 6,
      fontStyle: 'bold'
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);

    // 添加背景色
    this.cameras.main.setBackgroundColor('#2c3e50');
  }

  update(time, delta) {
    if (this.gameCompleted) {
      // 游戏完成后停止更新
      return;
    }

    // 玩家移动控制
    const acceleration = 600;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }
  }

  collectHexagon(player, hexagon) {
    // 销毁六边形
    hexagon.destroy();
    
    // 增加计数
    this.collectedCount++;
    
    // 更新UI
    this.scoreText.setText(`已收集: ${this.collectedCount}/${this.totalHexagons}`);

    // 添加收集音效替代（使用粒子效果）
    this.createCollectEffect(hexagon.x, hexagon.y);

    // 检查是否收集完成
    if (this.collectedCount >= this.totalHexagons) {
      this.completeGame();
    }
  }

  createCollectEffect(x, y) {
    // 创建简单的粒子效果
    const particles = this.add.particles('hexagon');
    const emitter = particles.createEmitter({
      x: x,
      y: y,
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 8,
      blendMode: 'ADD'
    });

    // 500ms后销毁粒子系统
    this.time.delayedCall(500, () => {
      particles.destroy();
    });
  }

  completeGame() {
    this.gameCompleted = true;
    
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);

    // 显示通关文本
    this.victoryText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.victoryText,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      repeat: -1,
      duration: 500,
      ease: 'Sine.easeInOut'
    });

    // 隐藏操作提示
    this.instructionText.setVisible(false);

    // 输出状态信号
    console.log('Game Completed! Score:', this.collectedCount);
  }

  generateRandomPositions(count) {
    const positions = [];
    const minDistance = 80; // 最小间距
    const margin = 60; // 边缘留白
    const maxAttempts = 100; // 最大尝试次数

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, y;

      while (!validPosition && attempts < maxAttempts) {
        x = Phaser.Math.Between(margin, 800 - margin);
        y = Phaser.Math.Between(margin, 600 - margin);

        // 检查是否与玩家初始位置太近
        const distToPlayer = Phaser.Math.Distance.Between(x, y, 400, 300);
        if (distToPlayer < 100) {
          attempts++;
          continue;
        }

        // 检查是否与其他六边形太近
        validPosition = true;
        for (let j = 0; j < positions.length; j++) {
          const dist = Phaser.Math.Distance.Between(x, y, positions[j].x, positions[j].y);
          if (dist < minDistance) {
            validPosition = false;
            break;
          }
        }

        attempts++;
      }

      positions.push({ x, y });
    }

    return positions;
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: CollectionGame
};

new Phaser.Game(config);