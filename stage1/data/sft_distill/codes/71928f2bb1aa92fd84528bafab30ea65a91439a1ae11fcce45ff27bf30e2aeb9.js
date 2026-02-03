class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号
    this.speed = 300;
  }

  preload() {
    // 使用 Graphics 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('greenBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建5个绿色对象，分散布局
    const positions = [
      { x: 200, y: 200 },
      { x: 400, y: 200 },
      { x: 600, y: 200 },
      { x: 300, y: 400 },
      { x: 500, y: 400 }
    ];

    positions.forEach(pos => {
      const obj = this.add.sprite(pos.x, pos.y, 'greenBox');
      this.objects.push(obj);
    });

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示总移动距离
    this.distanceText = this.add.text(10, 10, 'Total Distance: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 添加控制说明
    this.add.text(10, 40, 'Use Arrow Keys to move all objects', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -this.speed;
    } else if (this.cursors.right.isDown) {
      velocityX = this.speed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.speed;
    } else if (this.cursors.down.isDown) {
      velocityY = this.speed;
    }

    // 同步移动所有对象
    if (velocityX !== 0 || velocityY !== 0) {
      const deltaSeconds = delta / 1000;
      const moveX = velocityX * deltaSeconds;
      const moveY = velocityY * deltaSeconds;

      this.objects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界检测，防止对象移出屏幕
        obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
        obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
      });

      // 计算移动距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance;

      // 更新显示
      this.distanceText.setText(`Total Distance: ${Math.floor(this.totalDistance)}`);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);