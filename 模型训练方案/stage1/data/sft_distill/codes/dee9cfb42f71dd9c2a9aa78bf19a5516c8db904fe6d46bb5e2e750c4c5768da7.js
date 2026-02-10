class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0; // 状态信号：记录移动操作次数
    this.objects = []; // 存储8个对象
  }

  preload() {
    // 使用Graphics创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('orangeCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建8个橙色对象，排列成2行4列
    const startX = 200;
    const startY = 200;
    const spacingX = 100;
    const spacingY = 100;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        
        // 创建带物理属性的sprite
        const obj = this.physics.add.sprite(x, y, 'orangeCircle');
        obj.setCollideWorldBounds(true); // 限制在世界边界内
        this.objects.push(obj);
      }
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, 'Move Count: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示提示信息
    this.add.text(10, 40, 'Use Arrow Keys to move all objects', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键输入
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

    // 更新移动计数（仅在开始移动时计数一次）
    if (isMoving && !this.wasMoving) {
      this.moveCount++;
      this.statusText.setText(`Move Count: ${this.moveCount}`);
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