class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.cursors = null;
    // 状态信号：记录所有对象的总移动距离
    this.totalDistance = 0;
    this.moveSpeed = 120;
  }

  preload() {
    // 使用 Graphics 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFF00, 1); // 黄色
    graphics.fillCircle(20, 20, 20); // 半径 20 的圆形
    graphics.generateTexture('yellowCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建 5 个黄色对象，分布在屏幕上
    const positions = [
      { x: 200, y: 300 },
      { x: 400, y: 200 },
      { x: 400, y: 400 },
      { x: 600, y: 300 },
      { x: 400, y: 300 }
    ];

    for (let i = 0; i < 5; i++) {
      const obj = this.add.sprite(positions[i].x, positions[i].y, 'yellowCircle');
      obj.setData('startX', positions[i].x);
      obj.setData('startY', positions[i].y);
      this.objects.push(obj);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加提示文字
    this.add.text(400, 550, '使用方向键控制所有黄色圆形移动', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -this.moveSpeed;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.moveSpeed;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.moveSpeed;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.moveSpeed;
      isMoving = true;
    }

    // 同步更新所有对象的位置
    if (isMoving) {
      const deltaSeconds = delta / 1000;
      const moveX = velocityX * deltaSeconds;
      const moveY = velocityY * deltaSeconds;
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      
      this.totalDistance += distance * this.objects.length;

      this.objects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界限制
        obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
        obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
      });

      this.updateStatusText();
    }
  }

  updateStatusText() {
    // 计算所有对象相对于起始位置的平均偏移
    let totalOffsetX = 0;
    let totalOffsetY = 0;
    
    this.objects.forEach(obj => {
      const startX = obj.getData('startX');
      const startY = obj.getData('startY');
      totalOffsetX += Math.abs(obj.x - startX);
      totalOffsetY += Math.abs(obj.y - startY);
    });

    const avgOffsetX = (totalOffsetX / this.objects.length).toFixed(1);
    const avgOffsetY = (totalOffsetY / this.objects.length).toFixed(1);

    this.statusText.setText([
      `对象数量: ${this.objects.length}`,
      `移动速度: ${this.moveSpeed}`,
      `总移动距离: ${this.totalDistance.toFixed(1)}`,
      `平均偏移: X=${avgOffsetX}, Y=${avgOffsetY}`
    ]);
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