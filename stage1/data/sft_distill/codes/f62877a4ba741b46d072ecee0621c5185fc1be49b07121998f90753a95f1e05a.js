class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号
    this.moveSpeed = 80;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆形
    graphics.generateTexture('pinkCircle', 32, 32);
    graphics.destroy();

    // 创建10个粉色对象，随机分布
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.add.sprite(x, y, 'pinkCircle');
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

    // 添加说明文本
    this.add.text(10, 560, '使用方向键同时控制所有粉色对象', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatus();
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

    // 同步移动所有对象
    if (velocityX !== 0 || velocityY !== 0) {
      const deltaSeconds = delta / 1000;
      const moveX = velocityX * deltaSeconds;
      const moveY = velocityY * deltaSeconds;
      
      // 计算移动距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance;

      // 移动所有对象
      this.objects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界检测（可选：让对象在边界内循环）
        if (obj.x < 0) obj.x = 800;
        if (obj.x > 800) obj.x = 0;
        if (obj.y < 0) obj.y = 600;
        if (obj.y > 600) obj.y = 0;
      });

      this.updateStatus();
    }
  }

  updateStatus() {
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