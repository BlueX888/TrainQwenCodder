class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号
    this.speed = 80;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('yellowCircle', 40, 40);
    graphics.destroy();

    // 创建8个黄色对象，排列成2行4列
    const startX = 150;
    const startY = 150;
    const spacingX = 120;
    const spacingY = 120;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const obj = this.add.image(x, y, 'yellowCircle');
        this.objects.push(obj);
      }
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

    // 添加说明文字
    this.add.text(10, 550, '使用方向键控制所有黄色圆形同步移动', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    let moved = false;
    let dx = 0;
    let dy = 0;

    // 检测方向键并计算移动向量
    if (this.cursors.left.isDown) {
      dx = -this.speed * deltaSeconds;
      moved = true;
    } else if (this.cursors.right.isDown) {
      dx = this.speed * deltaSeconds;
      moved = true;
    }

    if (this.cursors.up.isDown) {
      dy = -this.speed * deltaSeconds;
      moved = true;
    } else if (this.cursors.down.isDown) {
      dy = this.speed * deltaSeconds;
      moved = true;
    }

    // 同步移动所有对象
    if (moved) {
      this.objects.forEach(obj => {
        obj.x += dx;
        obj.y += dy;

        // 边界检测，防止对象移出屏幕
        obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
        obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
      });

      // 计算移动距离
      const distance = Math.sqrt(dx * dx + dy * dy);
      this.totalDistance += distance;

      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `对象数量: ${this.objects.length} | 总移动距离: ${Math.floor(this.totalDistance)}px`
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