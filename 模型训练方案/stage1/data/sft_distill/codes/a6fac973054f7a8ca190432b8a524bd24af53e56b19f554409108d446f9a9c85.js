// 收集游戏：收集3个三角形通关
class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0;
    this.totalTriangles = 3;
    this.gameCompleted = false;
  }

  preload() {
    // 创建玩家纹理（圆形）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建三角形纹理
    const triangleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    triangleGraphics.fillStyle(0xffff00, 1);
    triangleGraphics.beginPath();
    triangleGraphics.moveTo(16, 0);
    triangleGraphics.lineTo(32, 32);
    triangleGraphics.lineTo(0, 32);
    triangleGraphics.closePath();
    triangleGraphics.fillPath();
    triangleGraphics.generateTexture('triangle', 32, 32);
    triangleGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      collectedCount: 0,
      totalTriangles: 3,
      gameCompleted: false,
      playerPosition: { x: 0, y: 0 }
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建三角形组
    this.triangles = this.physics.add.group();

    // 随机生成3个三角形
    const positions = this.generateRandomPositions(3);
    positions.forEach(pos => {
      const triangle = this.triangles.create(pos.x, pos.y, 'triangle');
      triangle.setCollideWorldBounds(true);
      // 添加旋转动画效果
      this.tweens.add({
        targets: triangle,
        angle: 360,
        duration: 2000,
        repeat: -1,
        ease: 'Linear'
      });
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.triangles,
      this.collectTriangle,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集进度: ${this.collectedCount}/${this.totalTriangles}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.congratsText = null;

    // 添加控制提示
    this.add.text(16, 50, '使用方向键移动', {
      fontSize: '18px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });

    console.log(JSON.stringify({
      event: 'game_start',
      totalTriangles: this.totalTriangles,
      playerPosition: { x: this.player.x, y: this.player.y }
    }));
  }

  update() {
    if (this.gameCompleted) {
      return;
    }

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

    // 更新信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
  }

  collectTriangle(player, triangle) {
    // 销毁三角形
    triangle.destroy();

    // 增加收集计数
    this.collectedCount++;

    // 更新UI
    this.scoreText.setText(`收集进度: ${this.collectedCount}/${this.totalTriangles}`);

    // 更新信号
    window.__signals__.collectedCount = this.collectedCount;

    console.log(JSON.stringify({
      event: 'triangle_collected',
      collectedCount: this.collectedCount,
      totalTriangles: this.totalTriangles,
      remaining: this.totalTriangles - this.collectedCount
    }));

    // 检查是否收集完成
    if (this.collectedCount >= this.totalTriangles) {
      this.completeGame();
    }
  }

  completeGame() {
    this.gameCompleted = true;

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示恭喜通关文本
    this.congratsText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.congratsText.setOrigin(0.5);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.congratsText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 更新信号
    window.__signals__.gameCompleted = true;

    console.log(JSON.stringify({
      event: 'game_completed',
      collectedCount: this.collectedCount,
      totalTriangles: this.totalTriangles,
      success: true
    }));
  }

  generateRandomPositions(count) {
    const positions = [];
    const margin = 50;
    const minDistance = 100;

    for (let i = 0; i < count; i++) {
      let validPosition = false;
      let attempts = 0;
      let pos;

      while (!validPosition && attempts < 100) {
        pos = {
          x: Phaser.Math.Between(margin, 800 - margin),
          y: Phaser.Math.Between(margin, 600 - margin)
        };

        // 检查与玩家初始位置的距离
        const distToPlayer = Phaser.Math.Distance.Between(pos.x, pos.y, 400, 300);
        if (distToPlayer < 100) {
          attempts++;
          continue;
        }

        // 检查与其他三角形的距离
        validPosition = true;
        for (let j = 0; j < positions.length; j++) {
          const dist = Phaser.Math.Distance.Between(
            pos.x, pos.y,
            positions[j].x, positions[j].y
          );
          if (dist < minDistance) {
            validPosition = false;
            break;
          }
        }

        attempts++;
      }

      positions.push(pos);
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