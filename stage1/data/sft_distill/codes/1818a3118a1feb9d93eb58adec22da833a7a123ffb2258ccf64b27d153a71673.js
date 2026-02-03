class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0; // 可验证的状态信号
    this.totalHexagons = 8;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建六边形纹理
    const hexGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    hexGraphics.lineStyle(3, 0xffff00, 1);
    hexGraphics.fillStyle(0xff9900, 1);
    
    // 绘制六边形
    const hexRadius = 20;
    const hexPath = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = 25 + hexRadius * Math.cos(angle);
      const y = 25 + hexRadius * Math.sin(angle);
      hexPath.push(new Phaser.Math.Vector2(x, y));
    }
    hexGraphics.fillPoints(hexPath, true);
    hexGraphics.strokePoints(hexPath, true);
    hexGraphics.generateTexture('hexagon', 50, 50);
    hexGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建六边形组
    this.hexagons = this.physics.add.group();

    // 随机生成 8 个六边形
    for (let i = 0; i < this.totalHexagons; i++) {
      let x, y;
      let validPosition = false;
      
      // 确保六边形不与玩家初始位置重叠
      while (!validPosition) {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
        const distance = Phaser.Math.Distance.Between(x, y, 400, 300);
        if (distance > 80) {
          validPosition = true;
        }
      }
      
      const hexagon = this.hexagons.create(x, y, 'hexagon');
      hexagon.setScale(1);
      
      // 添加旋转动画
      this.tweens.add({
        targets: hexagon,
        angle: 360,
        duration: 3000,
        repeat: -1,
        ease: 'Linear'
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

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建计数文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.collectedCount}/${this.totalHexagons}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建控制提示
    this.add.text(16, 560, '使用方向键移动', {
      fontSize: '18px',
      fill: '#cccccc'
    });

    // 通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '64px',
      fill: '#ffff00',
      stroke: '#ff0000',
      strokeThickness: 6,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000',
        blur: 5,
        fill: true
      }
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 300;

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

  collectHexagon(player, hexagon) {
    // 收集六边形
    hexagon.destroy();
    this.collectedCount++;

    // 更新计数文本
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalHexagons}`);

    // 播放收集音效（使用视觉反馈代替）
    this.cameras.main.flash(100, 255, 255, 0);

    // 检查是否通关
    if (this.collectedCount >= this.totalHexagons) {
      this.gameWin();
    }
  }

  gameWin() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 显示通关文本
    this.winText.setVisible(true);

    // 添加文本缩放动画
    this.tweens.add({
      targets: this.winText,
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 添加背景闪烁效果
    this.tweens.add({
      targets: this.cameras.main,
      alpha: { from: 1, to: 0.7 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    console.log('游戏通关！收集数量:', this.collectedCount);
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

// 启动游戏
const game = new Phaser.Game(config);