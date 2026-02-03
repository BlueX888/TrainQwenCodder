class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 状态信号：总移动距离
    this.activeObjects = 0; // 状态信号：活跃对象数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 程序化生成粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF1493, 1); // 粉色 (Deep Pink)
    graphics.fillCircle(16, 16, 16); // 半径 16px 的圆形
    graphics.generateTexture('pinkCircle', 32, 32);
    graphics.destroy();

    // 创建 20 个粉色对象，随机分布
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.add.sprite(x, y, 'pinkCircle');
      this.objects.push(obj);
    }

    this.activeObjects = this.objects.length;

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    const speed = 80;
    const distance = speed * (delta / 1000); // 根据帧时间计算移动距离
    let moved = false;

    // 同步移动所有对象
    this.objects.forEach(obj => {
      if (this.cursors.left.isDown) {
        obj.x -= distance;
        moved = true;
      } else if (this.cursors.right.isDown) {
        obj.x += distance;
        moved = true;
      }

      if (this.cursors.up.isDown) {
        obj.y -= distance;
        moved = true;
      } else if (this.cursors.down.isDown) {
        obj.y += distance;
        moved = true;
      }

      // 边界处理：循环到对面
      if (obj.x < -16) obj.x = 816;
      if (obj.x > 816) obj.x = -16;
      if (obj.y < -16) obj.y = 616;
      if (obj.y > 616) obj.y = -16;
    });

    // 更新总移动距离
    if (moved) {
      this.totalDistance += distance;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Active Objects: ${this.activeObjects}\n` +
      `Total Distance: ${Math.floor(this.totalDistance)}px\n` +
      `Use Arrow Keys to Move`
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