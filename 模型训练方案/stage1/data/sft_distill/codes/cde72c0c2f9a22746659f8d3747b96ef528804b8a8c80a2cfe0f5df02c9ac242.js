class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号：总移动距离
    this.moveCount = 0; // 可验证的状态信号：移动次数
  }

  preload() {
    // 使用Graphics创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('redSquare', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建3个红色对象，分别放置在不同位置
    const positions = [
      { x: 200, y: 300 },
      { x: 400, y: 300 },
      { x: 600, y: 300 }
    ];

    positions.forEach(pos => {
      const obj = this.add.sprite(pos.x, pos.y, 'redSquare');
      this.objects.push(obj);
    });

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示状态的文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.updateStatusText();
  }

  update(time, delta) {
    const speed = 120;
    const distance = speed * (delta / 1000); // 根据时间差计算移动距离
    let moved = false;

    // 同步移动所有对象
    if (this.cursors.left.isDown) {
      this.objects.forEach(obj => {
        obj.x -= distance;
      });
      moved = true;
    }
    
    if (this.cursors.right.isDown) {
      this.objects.forEach(obj => {
        obj.x += distance;
      });
      moved = true;
    }
    
    if (this.cursors.up.isDown) {
      this.objects.forEach(obj => {
        obj.y -= distance;
      });
      moved = true;
    }
    
    if (this.cursors.down.isDown) {
      this.objects.forEach(obj => {
        obj.y += distance;
      });
      moved = true;
    }

    // 更新状态
    if (moved) {
      this.totalDistance += distance;
      this.moveCount++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `Objects: ${this.objects.length}`,
      `Total Distance: ${Math.floor(this.totalDistance)}`,
      `Move Count: ${this.moveCount}`,
      `Positions: (${Math.floor(this.objects[0].x)}, ${Math.floor(this.objects[0].y)}), ` +
      `(${Math.floor(this.objects[1].x)}, ${Math.floor(this.objects[1].y)}), ` +
      `(${Math.floor(this.objects[2].x)}, ${Math.floor(this.objects[2].y)})`
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