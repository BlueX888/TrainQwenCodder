class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.speed = 160;
    this.totalDistance = 0; // 可验证的状态信号
    this.objectCount = 5;
  }

  preload() {
    // 使用Graphics创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('pinkCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建5个粉色对象，分散排列
    const positions = [
      { x: 200, y: 200 },
      { x: 400, y: 150 },
      { x: 600, y: 200 },
      { x: 300, y: 400 },
      { x: 500, y: 400 }
    ];

    for (let i = 0; i < this.objectCount; i++) {
      const obj = this.add.sprite(
        positions[i].x, 
        positions[i].y, 
        'pinkCircle'
      );
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加提示文本
    this.add.text(10, 550, '使用方向键控制所有粉色对象移动', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    let moved = false;
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键状态
    if (this.cursors.left.isDown) {
      velocityX = -this.speed;
      moved = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.speed;
      moved = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.speed;
      moved = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.speed;
      moved = true;
    }

    // 同步移动所有对象
    if (moved) {
      const deltaSeconds = delta / 1000;
      const moveX = velocityX * deltaSeconds;
      const moveY = velocityY * deltaSeconds;

      this.objects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界限制（可选）
        obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
        obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
      });

      // 计算移动距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance;

      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `对象数量: ${this.objectCount} | ` +
      `速度: ${this.speed} | ` +
      `总移动距离: ${Math.floor(this.totalDistance)}`
    );
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