class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号：总移动距离
    this.activeObjects = 12; // 可验证的状态信号：活跃对象数量
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillCircle(20, 20, 20); // 半径20的圆形
    graphics.generateTexture('cyanCircle', 40, 40);
    graphics.destroy();

    // 创建12个对象，排列成3行4列
    const rows = 3;
    const cols = 4;
    const startX = 150;
    const startY = 150;
    const spacingX = 150;
    const spacingY = 150;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const obj = this.add.image(x, y, 'cyanCircle');
        this.objects.push(obj);
      }
    }

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
    const speed = 360; // 像素/秒
    const moveDistance = speed * (delta / 1000); // 根据帧时间计算移动距离

    let moved = false;
    let dx = 0;
    let dy = 0;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      dx = -moveDistance;
      moved = true;
    } else if (this.cursors.right.isDown) {
      dx = moveDistance;
      moved = true;
    }

    if (this.cursors.up.isDown) {
      dy = -moveDistance;
      moved = true;
    } else if (this.cursors.down.isDown) {
      dy = moveDistance;
      moved = true;
    }

    // 同步移动所有对象
    if (moved) {
      this.objects.forEach(obj => {
        obj.x += dx;
        obj.y += dy;
      });

      // 更新总移动距离
      const actualDistance = Math.sqrt(dx * dx + dy * dy);
      this.totalDistance += actualDistance;
      
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `Active Objects: ${this.activeObjects}`,
      `Total Distance: ${Math.floor(this.totalDistance)}px`,
      `Speed: 360 px/s`,
      '',
      'Use Arrow Keys to Move'
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);