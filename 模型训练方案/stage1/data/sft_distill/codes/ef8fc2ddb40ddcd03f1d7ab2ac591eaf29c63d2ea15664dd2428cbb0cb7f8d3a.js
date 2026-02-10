class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号
    this.speed = 300;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用Graphics创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆形
    graphics.generateTexture('pinkCircle', 32, 32);
    graphics.destroy();

    // 创建20个粉色对象，随机分布
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.add.image(x, y, 'pinkCircle');
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示状态的文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, '使用方向键控制所有粉色圆形移动', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 计算移动向量
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -1;
    } else if (this.cursors.right.isDown) {
      velocityX = 1;
    }

    if (this.cursors.up.isDown) {
      velocityY = -1;
    } else if (this.cursors.down.isDown) {
      velocityY = 1;
    }

    // 如果有移动输入
    if (velocityX !== 0 || velocityY !== 0) {
      // 归一化对角线移动速度
      const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      velocityX /= length;
      velocityY /= length;

      // 计算实际移动距离
      const moveDistance = this.speed * (delta / 1000);
      const deltaX = velocityX * moveDistance;
      const deltaY = velocityY * moveDistance;

      // 同步移动所有对象
      this.objects.forEach(obj => {
        obj.x += deltaX;
        obj.y += deltaY;

        // 边界处理：循环到对面
        if (obj.x < -16) obj.x = 816;
        if (obj.x > 816) obj.x = -16;
        if (obj.y < -16) obj.y = 616;
        if (obj.y > 616) obj.y = -16;
      });

      // 累计总移动距离
      this.totalDistance += moveDistance;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `对象数量: ${this.objects.length}\n` +
      `移动速度: ${this.speed}\n` +
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