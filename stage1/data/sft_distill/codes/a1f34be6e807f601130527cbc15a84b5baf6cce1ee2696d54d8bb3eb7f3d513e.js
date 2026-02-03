class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0; // 可验证状态变量
    this.totalHexagons = 8;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理
    this.createPlayerTexture();
    
    // 创建六边形纹理
    this.createHexagonTexture();
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建收集物组
    this.hexagons = this.physics.add.group();
    
    // 随机生成8个六边形
    for (let i = 0; i < this.totalHexagons; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const hexagon = this.hexagons.create(x, y, 'hexagon');
      hexagon.setScale(0.8);
    }
    
    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.hexagons,
      this.collectHexagon,
      null,
      this
    );
    
    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 创建UI文本
    this.scoreText = this.add.text(16, 16, '收集进度: 0/8', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
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

  createPlayerTexture() {
    // 使用Graphics绘制玩家（蓝色圆形）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0088ff, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
  }

  createHexagonTexture() {
    // 使用Graphics绘制六边形
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffaa00, 1);
    graphics.lineStyle(3, 0xffffff, 1);
    
    // 绘制六边形
    const centerX = 25;
    const centerY = 25;
    const radius = 20;
    const points = [];
    
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
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
    graphics.strokePath();
    
    graphics.generateTexture('hexagon', 50, 50);
    graphics.destroy();
  }

  collectHexagon(player, hexagon) {
    // 收集六边形
    hexagon.destroy();
    this.collectedCount++;
    
    // 更新UI
    this.scoreText.setText(`收集进度: ${this.collectedCount}/${this.totalHexagons}`);
    
    // 检查是否通关
    if (this.collectedCount >= this.totalHexagons) {
      this.winGame();
    }
  }

  winGame() {
    // 显示通关文本
    this.winText.setVisible(true);
    
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.winText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
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