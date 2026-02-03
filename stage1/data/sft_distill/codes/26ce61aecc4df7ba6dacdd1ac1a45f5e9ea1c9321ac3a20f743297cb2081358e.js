class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号
    this.moveSpeed = 300;
  }

  preload() {
    // 使用Graphics创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillCircle(25, 25, 25); // 半径25的圆
    graphics.generateTexture('orangeCircle', 50, 50);
    graphics.destroy();
  }

  create() {
    // 创建8个橙色对象，排列成2行4列
    const startX = 200;
    const startY = 200;
    const spacingX = 120;
    const spacingY = 120;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const obj = this.add.image(x, y, 'orangeCircle');
        this.objects.push(obj);
      }
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加提示文本
    this.add.text(10, 550, '使用方向键控制所有橙色对象移动', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键状态
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

    // 同步移动所有对象
    if (isMoving) {
      const deltaSeconds = delta / 1000;
      const moveX = velocityX * deltaSeconds;
      const moveY = velocityY * deltaSeconds;

      // 计算移动距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance;

      // 更新所有对象的位置
      this.objects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界限制（可选）
        obj.x = Phaser.Math.Clamp(obj.x, 25, 775);
        obj.y = Phaser.Math.Clamp(obj.y, 25, 575);
      });

      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `对象数量: ${this.objects.length}\n` +
      `移动速度: ${this.moveSpeed}\n` +
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