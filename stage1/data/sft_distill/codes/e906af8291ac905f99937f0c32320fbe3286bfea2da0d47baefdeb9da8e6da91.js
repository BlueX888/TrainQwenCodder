class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.speed = 300;
  }

  preload() {
    // 创建紫色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('purpleCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建5个紫色对象，排列成一行
    const startX = 200;
    const startY = 300;
    const spacing = 100;

    for (let i = 0; i < 5; i++) {
      const obj = this.physics.add.sprite(
        startX + i * spacing,
        startY,
        'purpleCircle'
      );
      obj.setCollideWorldBounds(true);
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化信号系统
    window.__signals__ = {
      objectCount: 5,
      speed: this.speed,
      positions: [],
      isMoving: false,
      direction: 'none',
      frameCount: 0
    };

    // 添加文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    console.log('[GAME_START]', JSON.stringify({
      timestamp: Date.now(),
      objectCount: 5,
      speed: this.speed
    }));
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let direction = 'none';
    let isMoving = false;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -this.speed;
      direction = 'left';
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.speed;
      direction = 'right';
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.speed;
      direction = direction === 'none' ? 'up' : direction + '-up';
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.speed;
      direction = direction === 'none' ? 'down' : direction + '-down';
      isMoving = true;
    }

    // 同步设置所有对象的速度
    const positions = [];
    this.objects.forEach((obj, index) => {
      obj.setVelocity(velocityX, velocityY);
      positions.push({
        id: index,
        x: Math.round(obj.x),
        y: Math.round(obj.y)
      });
    });

    // 更新信号
    window.__signals__.positions = positions;
    window.__signals__.isMoving = isMoving;
    window.__signals__.direction = direction;
    window.__signals__.frameCount++;

    // 每60帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log('[GAME_STATE]', JSON.stringify({
        timestamp: Date.now(),
        frame: window.__signals__.frameCount,
        isMoving: isMoving,
        direction: direction,
        positions: positions
      }));
    }

    // 更新显示文本
    this.statusText.setText([
      `Objects: ${this.objects.length}`,
      `Speed: ${this.speed}`,
      `Direction: ${direction}`,
      `Moving: ${isMoving}`,
      `Frame: ${window.__signals__.frameCount}`,
      `Pos[0]: (${positions[0].x}, ${positions[0].y})`
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

const game = new Phaser.Game(config);