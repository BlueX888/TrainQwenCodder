class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号
    this.moveSpeed = 300;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('pinkCircle', 32, 32);
    graphics.destroy();

    // 创建20个粉色对象，排列成4x5网格
    const cols = 5;
    const rows = 4;
    const spacingX = 120;
    const spacingY = 120;
    const startX = 100;
    const startY = 100;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const obj = this.add.image(x, y, 'pinkCircle');
        this.objects.push(obj);
      }
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    let moved = false;
    let dx = 0;
    let dy = 0;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      dx = -this.moveSpeed * deltaSeconds;
      moved = true;
    } else if (this.cursors.right.isDown) {
      dx = this.moveSpeed * deltaSeconds;
      moved = true;
    }

    if (this.cursors.up.isDown) {
      dy = -this.moveSpeed * deltaSeconds;
      moved = true;
    } else if (this.cursors.down.isDown) {
      dy = this.moveSpeed * deltaSeconds;
      moved = true;
    }

    // 同步移动所有对象
    if (moved) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      this.totalDistance += distance;

      this.objects.forEach(obj => {
        let newX = obj.x + dx;
        let newY = obj.y + dy;

        // 边界检测（保持对象在屏幕内）
        const radius = 16;
        newX = Phaser.Math.Clamp(newX, radius, this.cameras.main.width - radius);
        newY = Phaser.Math.Clamp(newY, radius, this.cameras.main.height - radius);

        obj.setPosition(newX, newY);
      });

      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Objects: ${this.objects.length}\n` +
      `Speed: ${this.moveSpeed}\n` +
      `Total Distance: ${Math.floor(this.totalDistance)}`
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