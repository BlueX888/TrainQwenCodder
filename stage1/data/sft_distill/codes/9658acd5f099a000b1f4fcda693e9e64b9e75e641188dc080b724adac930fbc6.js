class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0; // 可验证的状态信号：移动次数
    this.objects = []; // 存储所有可控制对象
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 创建粉色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(20, 20, 20); // 绘制圆形
    graphics.generateTexture('pinkObject', 40, 40);
    graphics.destroy();

    // 创建 10 个粉色对象，随机分布
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const obj = this.physics.add.sprite(x, y, 'pinkObject');
      obj.setCollideWorldBounds(true); // 防止对象移出边界
      this.objects.push(obj);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示移动次数
    this.moveText = this.add.text(10, 10, 'Moves: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示说明
    this.add.text(10, 40, 'Use Arrow Keys to move all objects', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    let isMoving = false;
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键输入
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

    // 更新移动计数（仅在开始移动时增加）
    if (isMoving && !this.wasMoving) {
      this.moveCount++;
      this.moveText.setText('Moves: ' + this.moveCount);
    }

    this.wasMoving = isMoving;
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