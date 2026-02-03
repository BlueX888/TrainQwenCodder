class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态信号
    this.objectsPositions = [];
    this.totalMovement = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('redBox', 40, 40);
    graphics.destroy();

    // 创建3个红色对象，分别放置在不同位置
    this.objects = [];
    const startPositions = [
      { x: 200, y: 300 },
      { x: 400, y: 300 },
      { x: 600, y: 300 }
    ];

    startPositions.forEach((pos, index) => {
      const obj = this.physics.add.sprite(pos.x, pos.y, 'redBox');
      obj.setCollideWorldBounds(true);
      this.objects.push(obj);
    });

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 更新初始位置状态
    this.updatePositionStatus();
  }

  update(time, delta) {
    const speed = 200;
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown) {
      velocityY = speed;
    }

    // 同步控制所有3个对象
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 计算总移动距离（用于验证）
    if (velocityX !== 0 || velocityY !== 0) {
      this.totalMovement += Math.sqrt(velocityX * velocityX + velocityY * velocityY) * delta / 1000;
    }

    // 更新位置状态
    this.updatePositionStatus();
  }

  updatePositionStatus() {
    // 记录所有对象的位置
    this.objectsPositions = this.objects.map((obj, index) => ({
      id: index,
      x: Math.round(obj.x),
      y: Math.round(obj.y)
    }));

    // 显示状态信息
    const posText = this.objectsPositions.map(p => 
      `Object ${p.id}: (${p.x}, ${p.y})`
    ).join('\n');
    
    this.statusText.setText(
      `Use Arrow Keys to Move\n` +
      `Total Movement: ${Math.round(this.totalMovement)}\n` +
      `${posText}`
    );
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