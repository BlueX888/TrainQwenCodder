class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.moveCount = 0; // 可验证的状态信号：移动计数
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
    // 创建 20 个紫色对象，随机分布在场景中
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.add.sprite(x, y, 'purpleBlock');
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示移动计数的文本
    this.moveText = this.add.text(10, 10, 'Move Count: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 40, 'Use Arrow Keys to move all 20 objects', {
      fontSize: '16px',
      color: '#cccccc'
    });
  }

  update(time, delta) {
    let isMoving = false;
    const velocity = {
      x: 0,
      y: 0
    };

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
      const deltaSeconds = delta / 1000;
      
      this.objects.forEach(obj => {
        obj.x += velocity.x * deltaSeconds;
        obj.y += velocity.y * deltaSeconds;

        // 边界检测，防止对象移出屏幕
        obj.x = Phaser.Math.Clamp(obj.x, 16, 784);
        obj.y = Phaser.Math.Clamp(obj.y, 16, 584);
      });

      // 更新移动计数（每帧增加）
      this.moveCount++;
      this.moveText.setText('Move Count: ' + this.moveCount);
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