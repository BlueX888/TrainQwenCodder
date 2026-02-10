class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.moveFrameCount = 0; // 状态信号：记录移动帧数
    this.totalDistance = 0; // 状态信号：记录总移动距离
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建紫色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932CC, 1); // 紫色
    graphics.fillCircle(16, 16, 16); // 圆形，半径16
    graphics.generateTexture('purpleObject', 32, 32);
    graphics.destroy();

    // 创建15个紫色对象，随机分布在画布上
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const obj = this.physics.add.sprite(x, y, 'purpleObject');
      obj.setCollideWorldBounds(true); // 限制在世界边界内
      obj.setDamping(true);
      obj.setDrag(0.99); // 添加阻力使移动更平滑
      
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(100);

    // 添加说明文本
    this.add.text(10, 560, '使用方向键控制所有紫色对象移动', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -240;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = 240;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -240;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = 240;
      isMoving = true;
    }

    // 同步控制所有对象
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 更新状态信号
    if (isMoving) {
      this.moveFrameCount++;
      // 计算移动距离（近似值）
      const frameDistance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * (delta / 1000);
      this.totalDistance += frameDistance;
    }

    // 更新状态显示
    this.statusText.setText([
      `对象数量: ${this.objects.length}`,
      `移动帧数: ${this.moveFrameCount}`,
      `总距离: ${Math.floor(this.totalDistance)}px`,
      `当前速度: ${Math.floor(Math.sqrt(velocityX * velocityX + velocityY * velocityY))}px/s`
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