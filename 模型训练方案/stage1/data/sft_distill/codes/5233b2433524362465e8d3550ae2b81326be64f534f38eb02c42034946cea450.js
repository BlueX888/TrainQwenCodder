class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0; // 可验证状态信号
    this.totalHexagons = 8;
  }

  preload() {
    // 创建玩家纹理（圆形）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建六边形纹理
    const hexGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    hexGraphics.fillStyle(0xffff00, 1);
    hexGraphics.lineStyle(2, 0xff8800, 1);
    
    // 绘制六边形
    const hexSize = 15;
    const hexPath = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = 20 + hexSize * Math.cos(angle);
      const y = 20 + hexSize * Math.sin(angle);
      hexPath.push(new Phaser.Math.Vector2(x, y));
    }
    hexGraphics.fillPoints(hexPath, true);
    hexGraphics.strokePoints(hexPath, true);
    hexGraphics.generateTexture('hexagon', 40, 40);
    hexGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);
    this.player.setMaxVelocity(300);

    // 创建六边形收集物组
    this.hexagons = this.physics.add.group();

    // 随机分布8个六边形
    const positions = this.generateRandomPositions(this.totalHexagons);
    positions.forEach(pos => {
      const hex = this.hexagons.create(pos.x, pos.y, 'hexagon');
      hex.setScale(1.2);
      // 添加旋转动画
      this.tweens.add({
        targets: hex,
        angle: 360,
        duration: 3000,
        repeat: -1,
        ease: 'Linear'
      });
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

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集进度: ${this.collectedCount}/${this.totalHexagons}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建通关文本（初始隐藏）
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

    // 添加提示文本
    this.add.text(400, 550, '使用方向键移动收集六边形', {
      fontSize: '20px',
      fill: '#cccccc'
    }).setOrigin(0.5);
  }

  update() {
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

  collectHexagon(player, hexagon) {
    // 移除六边形
    hexagon.destroy();
    
    // 增加收集计数
    this.collectedCount++;
    
    // 更新UI
    this.scoreText.setText(`收集进度: ${this.collectedCount}/${this.totalHexagons}`);

    // 添加收集音效（使用闪烁效果代替）
    this.cameras.main.flash(100, 255, 255, 0);

    // 检查是否通关
    if (this.collectedCount >= this.totalHexagons) {
      this.gameWin();
    }
  }

  gameWin() {
    // 显示通关文本
    this.winText.setVisible(true);
    
    // 添加通关动画
    this.tweens.add({
      targets: this.winText,
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);

    // 添加庆祝效果
    this.cameras.main.flash(1000, 255, 215, 0);
    
    // 禁用输入
    this.cursors.left.enabled = false;
    this.cursors.right.enabled = false;
    this.cursors.up.enabled = false;
    this.cursors.down.enabled = false;
  }

  generateRandomPositions(count) {
    const positions = [];
    const minDistance = 80; // 最小间距
    const margin = 60; // 边界边距
    const maxAttempts = 100; // 最大尝试次数

    for (let i = 0; i < count; i++) {
      let validPosition = false;
      let attempts = 0;
      let x, y;

      while (!validPosition && attempts < maxAttempts) {
        x = Phaser.Math.Between(margin, 800 - margin);
        y = Phaser.Math.Between(margin, 600 - margin);

        // 检查与玩家初始位置的距离
        const distToPlayer = Phaser.Math.Distance.Between(x, y, 400, 300);
        if (distToPlayer < 100) {
          attempts++;
          continue;
        }

        // 检查与已有位置的距离
        validPosition = true;
        for (let pos of positions) {
          const dist = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
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