class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.moveSpeed = 360;
  }

  preload() {
    // 使用 Graphics 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('blueCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建 10 个蓝色对象，排列成两行
    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const x = 150 + col * 120;
      const y = 200 + row * 150;
      
      const obj = this.physics.add.sprite(x, y, 'blueCircle');
      obj.setCollideWorldBounds(true);
      this.objects.push(obj);
    }

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化 signals
    window.__signals__ = {
      objectCount: 10,
      moveSpeed: this.moveSpeed,
      positions: [],
      isMoving: false,
      direction: 'none',
      frameCount: 0
    };

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let direction = 'none';
    let isMoving = false;

    // 检测方向键状态
    if (this.cursors.left.isDown) {
      velocityX = -this.moveSpeed;
      direction = 'left';
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.moveSpeed;
      direction = 'right';
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.moveSpeed;
      direction = direction === 'none' ? 'up' : direction + '-up';
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.moveSpeed;
      direction = direction === 'none' ? 'down' : direction + '-down';
      isMoving = true;
    }

    // 同步设置所有对象的速度
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 更新 signals
    window.__signals__.positions = this.objects.map((obj, index) => ({
      id: index,
      x: Math.round(obj.x),
      y: Math.round(obj.y)
    }));
    window.__signals__.isMoving = isMoving;
    window.__signals__.direction = direction;
    window.__signals__.velocityX = velocityX;
    window.__signals__.velocityY = velocityY;
    window.__signals__.frameCount++;

    // 更新状态文本
    const avgX = Math.round(this.objects.reduce((sum, obj) => sum + obj.x, 0) / 10);
    const avgY = Math.round(this.objects.reduce((sum, obj) => sum + obj.y, 0) / 10);
    
    this.statusText.setText([
      `Objects: ${this.objects.length}`,
      `Direction: ${direction}`,
      `Speed: ${this.moveSpeed}`,
      `Moving: ${isMoving ? 'YES' : 'NO'}`,
      `Avg Position: (${avgX}, ${avgY})`,
      `Frame: ${window.__signals__.frameCount}`
    ]);

    // 每 60 帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.frameCount,
        direction: direction,
        isMoving: isMoving,
        avgPosition: { x: avgX, y: avgY },
        objectCount: this.objects.length
      }));
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);