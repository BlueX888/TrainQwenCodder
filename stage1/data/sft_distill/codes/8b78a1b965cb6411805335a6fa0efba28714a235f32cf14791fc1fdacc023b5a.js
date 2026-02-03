class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
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
    this.createHexagonTexture();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500);

    // 创建六边形收集物组
    this.hexagons = this.physics.add.group();
    
    // 随机生成12个六边形
    for (let i = 0; i < this.totalHexagons; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const hexagon = this.hexagons.create(x, y, 'hexagon');
      hexagon.setScale(0.8);
    }

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

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.score}/${this.totalHexagons}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
  }

  createHexagonTexture() {
    // 绘制六边形
    const graphics = this.add.graphics();
    const size = 25;
    const centerX = 30;
    const centerY = 30;

    // 计算六边形的6个顶点
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      points.push(new Phaser.Geom.Point(x, y));
    }

    // 绘制填充的六边形
    graphics.fillStyle(0xff6600, 1);
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();

    // 绘制边框
    graphics.lineStyle(3, 0xffaa00, 1);
    graphics.strokePath();

    // 生成纹理
    graphics.generateTexture('hexagon', 60, 60);
    graphics.destroy();
  }

  collectHexagon(player, hexagon) {
    // 移除六边形
    hexagon.destroy();
    
    // 增加分数
    this.score++;
    
    // 更新分数文本
    this.scoreText.setText(`收集: ${this.score}/${this.totalHexagons}`);
    
    // 检查是否收集完所有六边形
    if (this.score >= this.totalHexagons) {
      this.winText.setVisible(true);
      this.player.setVelocity(0, 0);
      
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

  update(time, delta) {
    // 只有在未通关时才允许移动
    if (this.score < this.totalHexagons) {
      const speed = 300;

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

// 创建游戏实例
const game = new Phaser.Game(config);