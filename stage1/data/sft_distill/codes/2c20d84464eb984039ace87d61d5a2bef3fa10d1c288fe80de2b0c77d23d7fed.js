class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.players = [];
    this.totalDistance = 0; // 可验证的状态信号
    this.moveCount = 0; // 移动次数统计
  }

  preload() {
    // 使用 Graphics 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('greenBox', 40, 40);
    graphics.destroy();
  }

  create() {
    const speed = 300;
    
    // 创建3个绿色对象，水平排列
    const startY = 300;
    const positions = [
      { x: 200, y: startY },
      { x: 400, y: startY },
      { x: 600, y: startY }
    ];

    positions.forEach(pos => {
      const player = this.physics.add.sprite(pos.x, pos.y, 'greenBox');
      player.setCollideWorldBounds(true);
      player.body.setMaxVelocity(speed, speed);
      this.players.push(player);
    });

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新状态显示
    this.updateStatus();

    console.log('游戏初始化完成：3个绿色对象已创建');
    console.log('使用方向键控制所有对象同步移动');
  }

  update(time, delta) {
    const speed = 300;
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

    // 同步控制所有对象
    this.players.forEach(player => {
      player.setVelocity(velocityX, velocityY);
    });

    // 更新统计信息
    if (isMoving) {
      const distance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * delta / 1000;
      this.totalDistance += distance;
      this.moveCount++;
    }

    // 每60帧更新一次显示
    if (time % 1000 < 20) {
      this.updateStatus();
    }
  }

  updateStatus() {
    const positions = this.players.map((p, i) => 
      `对象${i + 1}: (${Math.round(p.x)}, ${Math.round(p.y)})`
    ).join('\n');
    
    this.statusText.setText(
      `同步控制状态\n` +
      `移动总距离: ${Math.round(this.totalDistance)}\n` +
      `移动帧数: ${this.moveCount}\n` +
      `${positions}`
    );
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);