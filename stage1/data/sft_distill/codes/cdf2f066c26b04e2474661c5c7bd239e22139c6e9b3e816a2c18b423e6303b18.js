class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0; // 可验证的状态信号：移动次数
    this.objects = []; // 存储所有粉色对象
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 1. 使用 Graphics 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(20, 20, 20); // 绘制半径为20的圆
    graphics.generateTexture('pinkCircle', 40, 40);
    graphics.destroy();

    // 2. 创建10个粉色对象，随机分布在场景中
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const obj = this.physics.add.sprite(x, y, 'pinkCircle');
      obj.setCollideWorldBounds(true); // 防止对象移出边界
      this.objects.push(obj);
    }

    // 3. 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示移动次数
    this.moveText = this.add.text(10, 10, 'Move Count: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    console.log('Game initialized: 10 pink objects created');
    console.log('Initial move count:', this.moveCount);
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -80;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = 80;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -80;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = 80;
      isMoving = true;
    }

    // 同步更新所有对象的速度
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 如果正在移动，增加移动计数（每60帧计数一次，避免过快增长）
    if (isMoving && time % 60 < delta) {
      this.moveCount++;
      this.moveText.setText('Move Count: ' + this.moveCount);
      
      // 每100次移动输出一次状态
      if (this.moveCount % 100 === 0) {
        console.log('Move count reached:', this.moveCount);
      }
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
const game = new Phaser.Game(config);