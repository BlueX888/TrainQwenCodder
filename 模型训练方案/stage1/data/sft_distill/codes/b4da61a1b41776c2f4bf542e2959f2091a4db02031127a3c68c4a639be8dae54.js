class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.moveCount = 0;        // 移动次数
    this.currentDirection = 'none';  // 当前移动方向
    this.objectsCreated = 0;   // 创建的对象数量
  }

  preload() {
    // 使用 Graphics 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1); // 橙色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('orangeCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建 8 个橙色对象
    this.objects = [];
    const positions = [
      { x: 200, y: 200 },
      { x: 400, y: 200 },
      { x: 600, y: 200 },
      { x: 200, y: 400 },
      { x: 400, y: 400 },
      { x: 600, y: 400 },
      { x: 300, y: 300 },
      { x: 500, y: 300 }
    ];

    positions.forEach(pos => {
      const obj = this.add.sprite(pos.x, pos.y, 'orangeCircle');
      this.objects.push(obj);
      this.objectsCreated++;
    });

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 移动速度
    this.moveSpeed = 300;

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    console.log('游戏初始化完成');
    console.log(`创建了 ${this.objectsCreated} 个橙色对象`);
    console.log('使用方向键控制所有对象移动');
  }

  update(time, delta) {
    // 计算移动增量（像素/秒 * 秒 = 像素）
    const moveDistance = this.moveSpeed * (delta / 1000);
    
    let moved = false;
    let direction = 'none';

    // 检测方向键并同步移动所有对象
    if (this.cursors.left.isDown) {
      this.objects.forEach(obj => {
        obj.x -= moveDistance;
      });
      moved = true;
      direction = 'left';
    } else if (this.cursors.right.isDown) {
      this.objects.forEach(obj => {
        obj.x += moveDistance;
      });
      moved = true;
      direction = 'right';
    }

    if (this.cursors.up.isDown) {
      this.objects.forEach(obj => {
        obj.y -= moveDistance;
      });
      moved = true;
      direction = direction === 'none' ? 'up' : direction + '+up';
    } else if (this.cursors.down.isDown) {
      this.objects.forEach(obj => {
        obj.y += moveDistance;
      });
      moved = true;
      direction = direction === 'none' ? 'down' : direction + '+down';
    }

    // 更新状态
    if (moved && this.currentDirection !== direction) {
      this.moveCount++;
      this.currentDirection = direction;
      this.updateStatusText();
    } else if (!moved) {
      this.currentDirection = 'none';
    }

    // 边界检测（防止对象移出屏幕）
    this.objects.forEach(obj => {
      obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
      obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
    });
  }

  updateStatusText() {
    this.statusText.setText([
      `对象数量: ${this.objectsCreated}`,
      `移动次数: ${this.moveCount}`,
      `当前方向: ${this.currentDirection}`,
      `移动速度: ${this.moveSpeed} px/s`
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

const game = new Phaser.Game(config);