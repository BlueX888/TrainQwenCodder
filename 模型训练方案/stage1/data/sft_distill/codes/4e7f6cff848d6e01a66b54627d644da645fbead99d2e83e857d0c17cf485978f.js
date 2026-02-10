class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0; // 可验证的状态信号：移动次数
    this.objects = []; // 存储所有粉色对象
  }

  preload() {
    // 程序化生成粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径 16 的圆形
    graphics.generateTexture('pinkCircle', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建 8 个粉色对象并随机分布
    const positions = [
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 500, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 400 },
      { x: 300, y: 400 },
      { x: 500, y: 400 },
      { x: 700, y: 400 }
    ];

    for (let i = 0; i < 8; i++) {
      const obj = this.add.sprite(positions[i].x, positions[i].y, 'pinkCircle');
      this.objects.push(obj);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本显示移动次数
    this.debugText = this.add.text(10, 10, 'Move Count: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键状态
    if (this.cursors.left.isDown) {
      velocityX = -200;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = 200;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -200;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = 200;
      isMoving = true;
    }

    // 同步设置所有对象的速度
    this.objects.forEach(obj => {
      obj.x += velocityX * (delta / 1000);
      obj.y += velocityY * (delta / 1000);

      // 边界检测，防止对象移出画布
      obj.x = Phaser.Math.Clamp(obj.x, 16, 784);
      obj.y = Phaser.Math.Clamp(obj.y, 16, 584);
    });

    // 更新移动计数
    if (isMoving) {
      this.moveCount++;
      this.debugText.setText(`Move Count: ${this.moveCount}`);
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