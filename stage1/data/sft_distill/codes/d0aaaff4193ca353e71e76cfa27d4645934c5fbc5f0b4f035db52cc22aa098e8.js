class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0;
    this.totalHexagons = 12;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建六边形纹理
    const hexGraphics = this.add.graphics();
    hexGraphics.fillStyle(0xffaa00, 1);
    this.drawHexagon(hexGraphics, 15, 15, 12);
    hexGraphics.generateTexture('hexagon', 30, 30);
    hexGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建六边形组
    this.hexagons = this.physics.add.group();

    // 随机生成12个六边形
    for (let i = 0; i < this.totalHexagons; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const hexagon = this.hexagons.create(x, y, 'hexagon');
      hexagon.setScale(1);
      
      // 添加呼吸动画效果
      this.tweens.add({
        targets: hexagon,
        scale: 1.2,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.hexagons,
      this.collectHexagon,
      null,
      this
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建计数文本
    this.scoreText = this.add.text(16, 16, `收集: 0/${this.totalHexagons}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '64px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 添加说明文本
    this.add.text(16, 50, '使用方向键移动收集六边形', {
      fontSize: '18px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
  }

  update(time, delta) {
    if (!this.player) return;

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

  // 绘制六边形
  drawHexagon(graphics, centerX, centerY, radius) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(new Phaser.Geom.Point(x, y));
    }
    
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();
  }

  // 收集六边形
  collectHexagon(player, hexagon) {
    // 移除六边形
    hexagon.destroy();
    
    // 更新计数
    this.collectedCount++;
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalHexagons}`);

    // 添加收集音效（使用简单的视觉反馈代替）
    const flash = this.add.circle(hexagon.x, hexagon.y, 20, 0xffffff, 0.8);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // 检查是否收集完所有六边形
    if (this.collectedCount >= this.totalHexagons) {
      this.showWinScreen();
    }
  }

  // 显示通关画面
  showWinScreen() {
    this.winText.setVisible(true);
    
    // 添加通关文字动画
    this.tweens.add({
      targets: this.winText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    
    // 禁用输入
    this.cursors = null;

    // 添加庆祝粒子效果
    this.createCelebrationEffect();
  }

  // 创建庆祝效果
  createCelebrationEffect() {
    for (let i = 0; i < 20; i++) {
      this.time.delayedCall(i * 100, () => {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        const color = Phaser.Display.Color.RandomRGB();
        const particle = this.add.circle(x, y, 8, color.color);
        
        this.tweens.add({
          targets: particle,
          y: y - 100,
          alpha: 0,
          duration: 1000,
          ease: 'Cubic.easeOut',
          onComplete: () => particle.destroy()
        });
      });
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
  scene: CollectionGame
};

// 创建游戏实例
const game = new Phaser.Game(config);