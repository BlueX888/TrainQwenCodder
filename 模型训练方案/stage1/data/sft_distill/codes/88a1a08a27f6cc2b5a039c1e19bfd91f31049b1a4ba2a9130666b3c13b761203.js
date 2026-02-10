class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 状态信号：记录所有对象移动的总距离
    this.moveSpeed = 80;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(16, 16, 16); // 半径16的圆形
    graphics.generateTexture('yellowCircle', 32, 32);
    graphics.destroy();

    // 创建8个黄色对象，排列成2行4列
    const startX = 200;
    const startY = 200;
    const spacingX = 100;
    const spacingY = 100;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const obj = this.add.sprite(x, y, 'yellowCircle');
        this.objects.push(obj);
      }
    }

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, 'Total Distance: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示控制提示
    this.add.text(10, 40, 'Use Arrow Keys to move all objects', {
      fontSize: '16px',
      fill: '#00ff00'
    });
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -this.moveSpeed;
    } else if (this.cursors.right.isDown) {
      velocityX = this.moveSpeed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.moveSpeed;
    } else if (this.cursors.down.isDown) {
      velocityY = this.moveSpeed;
    }

    // 如果有移动，同步更新所有对象
    if (velocityX !== 0 || velocityY !== 0) {
      const deltaSeconds = delta / 1000;
      const moveX = velocityX * deltaSeconds;
      const moveY = velocityY * deltaSeconds;

      // 计算本次移动距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance * this.objects.length;

      // 同步移动所有对象
      this.objects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界检测，防止对象移出屏幕
        obj.x = Phaser.Math.Clamp(obj.x, 16, 784);
        obj.y = Phaser.Math.Clamp(obj.y, 16, 584);
      });

      // 更新状态显示
      this.statusText.setText(`Total Distance: ${Math.floor(this.totalDistance)}`);
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