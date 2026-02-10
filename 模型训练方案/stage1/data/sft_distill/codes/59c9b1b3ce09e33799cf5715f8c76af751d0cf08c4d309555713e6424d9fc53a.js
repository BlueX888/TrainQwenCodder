class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
  }

  preload() {
    // 使用 Graphics 生成粉色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('pinkObstacle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器，每3秒生成一个障碍物
    this.time.addEvent({
      delay: 3000, // 3秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 立即生成第一个障碍物
    this.spawnObstacle();

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（留出边距）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 在顶部创建障碍物
    const obstacle = this.obstacles.create(randomX, -20, 'pinkObstacle');
    
    // 设置向下速度为 360
    obstacle.setVelocityY(360);
    
    // 增加计数
    this.obstacleCount++;
    
    console.log(`Obstacle #${this.obstacleCount} spawned at x: ${randomX}`);
  }

  update() {
    // 更新状态文本
    this.statusText.setText(`Obstacles spawned: ${this.obstacleCount}`);

    // 清理超出屏幕的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) {
        obstacle.destroy();
      }
    });
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
      gravity: { y: 0 }, // 不使用重力，直接设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);