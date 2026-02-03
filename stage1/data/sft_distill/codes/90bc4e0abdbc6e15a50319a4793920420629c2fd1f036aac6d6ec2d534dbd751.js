class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0; // 可验证的状态信号：记录移动操作次数
    this.objects = []; // 存储所有粉色对象
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 创建粉色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 绘制圆形
    graphics.generateTexture('pinkObject', 32, 32);
    graphics.destroy();

    // 创建 20 个粉色对象，随机分布
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.physics.add.sprite(x, y, 'pinkObject');
      obj.setCollideWorldBounds(true); // 限制在世界边界内
      this.objects.push(obj);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示移动次数
    this.moveText = this.add.text(10, 10, 'Move Count: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.moveText.setDepth(100);

    // 添加说明文本
    this.add.text(10, 50, 'Use Arrow Keys to move all objects', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    let isMoving = false;
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键状态
    if (this.cursors.left.isDown) {
      velocityX = -240;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = 240;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -240;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = 240;
      isMoving = true;
    }

    // 同步控制所有对象移动
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 更新移动计数（每帧移动时计数）
    if (isMoving) {
      this.moveCount++;
      this.moveText.setText(`Move Count: ${this.moveCount}`);
    }
  }
}

// Phaser 游戏配置
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

// 创建游戏实例
new Phaser.Game(config);