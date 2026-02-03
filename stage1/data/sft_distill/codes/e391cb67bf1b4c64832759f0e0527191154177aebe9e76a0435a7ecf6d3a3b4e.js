class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.moveCount = 0; // 状态信号：记录移动次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆形
    graphics.generateTexture('pinkCircle', 32, 32);
    graphics.destroy();

    // 创建8个粉色对象，分散在屏幕不同位置
    const positions = [
      { x: 200, y: 150 },
      { x: 400, y: 150 },
      { x: 600, y: 150 },
      { x: 200, y: 300 },
      { x: 400, y: 300 },
      { x: 600, y: 300 },
      { x: 200, y: 450 },
      { x: 400, y: 450 }
    ];

    for (let i = 0; i < 8; i++) {
      const obj = this.physics.add.sprite(
        positions[i].x,
        positions[i].y,
        'pinkCircle'
      );
      obj.setCollideWorldBounds(true); // 限制在世界边界内
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示移动次数
    this.moveText = this.add.text(10, 10, 'Moves: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    console.log('Game initialized with 8 pink objects');
  }

  update(time, delta) {
    const speed = 200;
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键状态
    if (this.cursors.left.isDown) {
      velocityX = -speed;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = speed;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -speed;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = speed;
      isMoving = true;
    }

    // 同步设置所有对象的速度
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 更新移动计数（每次方向改变时计数）
    if (isMoving && this.lastVelocity !== `${velocityX},${velocityY}`) {
      this.moveCount++;
      this.moveText.setText(`Moves: ${this.moveCount}`);
      this.lastVelocity = `${velocityX},${velocityY}`;
    } else if (!isMoving) {
      this.lastVelocity = null;
    }
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);