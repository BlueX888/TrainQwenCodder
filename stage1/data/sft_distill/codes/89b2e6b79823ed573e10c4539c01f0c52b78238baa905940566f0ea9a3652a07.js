class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.moveCount = 0; // 状态信号：记录移动次数
    this.isMoving = false; // 状态信号：是否正在移动
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 创建粉色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 圆形，半径16
    graphics.generateTexture('pinkObject', 32, 32);
    graphics.destroy();

    // 创建 10 个粉色对象
    for (let i = 0; i < 10; i++) {
      // 随机位置，避免超出边界
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const obj = this.physics.add.sprite(x, y, 'pinkObject');
      obj.setCollideWorldBounds(true); // 防止对象移出边界
      this.objects.push(obj);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.updateStatusText();
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let moving = false;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -240;
      moving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = 240;
      moving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -240;
      moving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = 240;
      moving = true;
    }

    // 同步更新所有对象的速度
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 更新移动状态
    if (moving && !this.isMoving) {
      this.moveCount++;
      this.isMoving = true;
      this.updateStatusText();
    } else if (!moving && this.isMoving) {
      this.isMoving = false;
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Objects: ${this.objects.length} | Move Count: ${this.moveCount} | Moving: ${this.isMoving}`
    );
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