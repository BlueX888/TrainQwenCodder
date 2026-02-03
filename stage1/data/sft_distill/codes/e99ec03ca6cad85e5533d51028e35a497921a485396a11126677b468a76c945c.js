class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0; // 可验证的状态信号：移动次数
    this.objects = []; // 存储所有紫色对象
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('purpleBlock', 32, 32);
    graphics.destroy();

    // 创建 20 个紫色对象并随机分布
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.physics.add.sprite(x, y, 'purpleBlock');
      obj.setCollideWorldBounds(true); // 限制在世界边界内
      this.objects.push(obj);
    }

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示移动次数的文本
    this.moveText = this.add.text(10, 10, 'Move Count: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 40, 'Use Arrow Keys to move all objects', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键状态
    if (this.cursors.left.isDown) {
      velocityX = -300;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = 300;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -300;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = 300;
      isMoving = true;
    }

    // 同步设置所有对象的速度
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 更新移动次数（当有移动时）
    if (isMoving && delta > 0) {
      this.moveCount++;
      this.moveText.setText('Move Count: ' + Math.floor(this.moveCount / 60));
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);