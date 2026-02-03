class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.speed = 160;
    this.totalDistance = 0; // 可验证的状态信号
    this.moveCount = 0; // 移动帧数计数
  }

  preload() {
    // 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('pinkCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建5个粉色对象，分布在不同位置
    const positions = [
      { x: 150, y: 200 },
      { x: 300, y: 200 },
      { x: 450, y: 200 },
      { x: 600, y: 200 },
      { x: 750, y: 200 }
    ];

    for (let i = 0; i < 5; i++) {
      const obj = this.add.image(positions[i].x, positions[i].y, 'pinkCircle');
      this.objects.push(obj);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加WASD键支持
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键输入
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      velocityX = -this.speed;
      isMoving = true;
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      velocityX = this.speed;
      isMoving = true;
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      velocityY = -this.speed;
      isMoving = true;
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      velocityY = this.speed;
      isMoving = true;
    }

    // 同步移动所有对象
    if (isMoving) {
      const deltaSeconds = delta / 1000;
      const moveX = velocityX * deltaSeconds;
      const moveY = velocityY * deltaSeconds;
      
      // 计算移动距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance;
      this.moveCount++;

      // 更新所有对象位置
      for (let obj of this.objects) {
        obj.x += moveX;
        obj.y += moveY;

        // 边界限制
        obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
        obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
      }

      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Objects: ${this.objects.length} | ` +
      `Speed: ${this.speed} | ` +
      `Total Distance: ${this.totalDistance.toFixed(2)} | ` +
      `Move Frames: ${this.moveCount}`
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