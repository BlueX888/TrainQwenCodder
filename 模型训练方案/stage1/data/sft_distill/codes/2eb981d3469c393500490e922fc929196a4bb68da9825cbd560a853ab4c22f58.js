class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.speed = 80;
    this.totalDistance = 0; // 可验证的状态信号
  }

  preload() {
    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('yellowCircle', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建8个黄色对象，排列成2行4列
    const startX = 200;
    const startY = 200;
    const spacing = 100;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const x = startX + col * spacing;
        const y = startY + row * spacing;
        const obj = this.add.image(x, y, 'yellowCircle');
        this.objects.push(obj);
      }
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.updateStatusText();
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
      });

      // 计算移动距离
      const distance = Math.sqrt(dx * dx + dy * dy);
      this.totalDistance += distance;
      
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `Objects: ${this.objects.length}`,
      `Speed: ${this.speed}`,
      `Total Distance: ${this.totalDistance.toFixed(2)}`,
      'Use Arrow Keys to Move'
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