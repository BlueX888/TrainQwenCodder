class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号
    this.moveSpeed = 240;
  }

  preload() {
    // 使用Graphics创建紫色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932CC, 1); // 紫色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('purpleCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建15个紫色对象，排列成3行5列
    const startX = 150;
    const startY = 150;
    const spacingX = 100;
    const spacingY = 100;
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const obj = this.add.sprite(x, y, 'purpleCircle');
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
    this.add.text(10, 40, 'Use Arrow Keys to Move All Objects', {
      fontSize: '16px',
      fill: '#00ff00'
    });

    // 显示对象数量
    this.add.text(10, 70, `Objects: ${this.objects.length}`, {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 计算移动增量（像素/秒 * 秒 = 像素）
    const moveDistance = this.moveSpeed * (delta / 1000);
    
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
      const distanceMoved = Math.sqrt(dx * dx + dy * dy);
      this.totalDistance += distanceMoved;
      
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