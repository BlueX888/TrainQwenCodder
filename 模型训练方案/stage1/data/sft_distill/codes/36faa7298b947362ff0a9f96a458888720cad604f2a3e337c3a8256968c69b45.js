class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号
    this.speed = 300;
  }

  preload() {
    // 程序化生成紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('purpleBlock', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建20个紫色对象，随机分布在场景中
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.add.sprite(x, y, 'purpleBlock');
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 570, '使用方向键控制所有紫色方块移动', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    let velocity = { x: 0, y: 0 };
    let isMoving = false;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocity.x = -this.speed;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocity.x = this.speed;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocity.y = -this.speed;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocity.y = this.speed;
      isMoving = true;
    }

    // 同步移动所有对象
    if (isMoving) {
      const moveX = velocity.x * deltaSeconds;
      const moveY = velocity.y * deltaSeconds;
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance;

      this.objects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界检测（可选，防止对象移出屏幕）
        obj.x = Phaser.Math.Clamp(obj.x, 16, 784);
        obj.y = Phaser.Math.Clamp(obj.y, 16, 584);
      });
    }

    // 更新状态显示
    this.statusText.setText(
      `对象数量: ${this.objects.length}\n` +
      `移动速度: ${this.speed}\n` +
      `总移动距离: ${Math.floor(this.totalDistance)}px`
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