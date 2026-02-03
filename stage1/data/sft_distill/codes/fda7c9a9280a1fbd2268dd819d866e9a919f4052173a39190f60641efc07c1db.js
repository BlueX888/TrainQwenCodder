class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号：总移动距离
    this.moveSpeed = 300;
  }

  preload() {
    // 使用Graphics创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('greenCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建5个绿色对象，分散在屏幕不同位置
    const positions = [
      { x: 200, y: 200 },
      { x: 400, y: 150 },
      { x: 600, y: 200 },
      { x: 300, y: 350 },
      { x: 500, y: 350 }
    ];

    positions.forEach(pos => {
      const obj = this.add.image(pos.x, pos.y, 'greenCircle');
      this.objects.push(obj);
    });

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
  }

  update(time, delta) {
    let moved = false;
    let dx = 0;
    let dy = 0;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      dx = -this.moveSpeed * (delta / 1000);
      moved = true;
    } else if (this.cursors.right.isDown) {
      dx = this.moveSpeed * (delta / 1000);
      moved = true;
    }

    if (this.cursors.up.isDown) {
      dy = -this.moveSpeed * (delta / 1000);
      moved = true;
    } else if (this.cursors.down.isDown) {
      dy = this.moveSpeed * (delta / 1000);
      moved = true;
    }

    // 同步移动所有对象
    if (moved) {
      this.objects.forEach(obj => {
        // 计算新位置
        let newX = obj.x + dx;
        let newY = obj.y + dy;

        // 边界检测（保持对象在屏幕内）
        newX = Phaser.Math.Clamp(newX, 20, 780);
        newY = Phaser.Math.Clamp(newY, 20, 580);

        // 更新位置
        obj.setPosition(newX, newY);
      });

      // 更新总移动距离
      const distance = Math.sqrt(dx * dx + dy * dy);
      this.totalDistance += distance;
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