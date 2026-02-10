class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0; // 可验证的状态信号：记录移动次数
    this.players = []; // 存储所有玩家对象
  }

  preload() {
    // 使用 Graphics 生成绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('greenBox', 40, 40);
    graphics.destroy();
  }

  create() {
    const speed = 300;
    
    // 创建3个绿色对象，分别位于不同位置
    const positions = [
      { x: 200, y: 300 },
      { x: 400, y: 300 },
      { x: 600, y: 300 }
    ];

    positions.forEach(pos => {
      const player = this.physics.add.sprite(pos.x, pos.y, 'greenBox');
      player.setCollideWorldBounds(true); // 限制在世界边界内
      this.players.push(player);
    });

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示状态信息
    this.statusText = this.add.text(10, 10, 'Move Count: 0', {
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
    this.players.forEach(player => {
      player.setVelocity(velocityX, velocityY);
    });

    // 更新移动计数（只在开始移动时计数一次）
    if (isMoving && !this.wasMoving) {
      this.moveCount++;
      this.statusText.setText(`Move Count: ${this.moveCount}`);
    }
    
    this.wasMoving = isMoving;
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
      gravity: { y: 0 }, // 无重力，自由移动
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);