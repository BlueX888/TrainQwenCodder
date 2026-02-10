class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0; // 可验证的状态信号：移动次数
    this.objects = []; // 存储所有粉色对象
  }

  preload() {
    // 使用 Graphics 程序化生成粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('pinkCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建8个粉色对象，排列成2行4列
    const positions = [
      { x: 150, y: 200 },
      { x: 300, y: 200 },
      { x: 450, y: 200 },
      { x: 600, y: 200 },
      { x: 150, y: 400 },
      { x: 300, y: 400 },
      { x: 450, y: 400 },
      { x: 600, y: 400 }
    ];

    positions.forEach((pos, index) => {
      const obj = this.physics.add.sprite(pos.x, pos.y, 'pinkCircle');
      obj.setCollideWorldBounds(true); // 限制在世界边界内
      this.objects.push(obj);
    });

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示移动次数
    this.moveText = this.add.text(10, 10, 'Move Count: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(10, 550, 'Use Arrow Keys to move all pink circles', {
      fontSize: '18px',
      fill: '#cccccc'
    });
  }

  update(time, delta) {
    const speed = 200;
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -speed;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = speed;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -speed;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = speed;
      isMoving = true;
    }

    // 同步控制所有8个对象
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 更新移动次数（当有移动时每秒增加一次计数）
    if (isMoving && !this.lastMoveTime) {
      this.lastMoveTime = time;
      this.moveCount++;
      this.moveText.setText('Move Count: ' + this.moveCount);
    } else if (isMoving && time - this.lastMoveTime > 1000) {
      this.lastMoveTime = time;
      this.moveCount++;
      this.moveText.setText('Move Count: ' + this.moveCount);
    } else if (!isMoving) {
      this.lastMoveTime = null;
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