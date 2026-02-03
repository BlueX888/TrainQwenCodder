class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 状态信号：总移动距离
    this.moveSpeed = 300;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('greenBox', 40, 40);
    graphics.destroy();

    // 创建5个绿色对象，排列成一行
    const startX = 200;
    const startY = 300;
    const spacing = 100;

    for (let i = 0; i < 5; i++) {
      const obj = this.add.image(startX + i * spacing, startY, 'greenBox');
      this.objects.push(obj);
    }

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加说明文本
    this.add.text(10, 550, 'Use Arrow Keys to move all 5 green boxes', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    let moved = false;
    let dx = 0;
    let dy = 0;

    // 检测方向键并计算移动量
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
      for (let i = 0; i < this.objects.length; i++) {
        this.objects[i].x += dx;
        this.objects[i].y += dy;
      }

      // 更新总移动距离
      const distance = Math.sqrt(dx * dx + dy * dy);
      this.totalDistance += distance;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Objects: ${this.objects.length} | ` +
      `Speed: ${this.moveSpeed} | ` +
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