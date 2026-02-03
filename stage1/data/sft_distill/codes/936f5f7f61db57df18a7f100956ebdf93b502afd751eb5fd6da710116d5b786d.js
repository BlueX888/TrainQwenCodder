class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.players = [];
    this.totalDistance = 0; // 验证状态：总移动距离
    this.moveCount = 0; // 验证状态：移动次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('greenBox', 40, 40);
    graphics.destroy();

    // 创建 3 个绿色对象，分别位于不同位置
    const positions = [
      { x: 200, y: 300 },
      { x: 400, y: 300 },
      { x: 600, y: 300 }
    ];

    positions.forEach(pos => {
      const player = this.physics.add.sprite(pos.x, pos.y, 'greenBox');
      player.setCollideWorldBounds(true);
      this.players.push(player);
    });

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -300;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = 300;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -300;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = 300;
      isMoving = true;
    }

    // 同步设置所有对象的速度
    this.players.forEach(player => {
      player.setVelocity(velocityX, velocityY);
    });

    // 更新状态统计
    if (isMoving) {
      const distance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * (delta / 1000);
      this.totalDistance += distance;
      this.moveCount++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText([
      'Use Arrow Keys to Move',
      `Total Distance: ${Math.floor(this.totalDistance)}`,
      `Move Frames: ${this.moveCount}`,
      `Objects: ${this.players.length}`
    ]);
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