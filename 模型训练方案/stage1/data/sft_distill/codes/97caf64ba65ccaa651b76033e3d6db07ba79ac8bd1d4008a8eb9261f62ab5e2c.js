class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
  }

  preload() {
    // 程序化生成粉色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理组来管理障碍物
    this.obstacles = this.physics.add.group();

    // 添加定时器事件：每3秒生成一个障碍物
    this.time.addEvent({
      delay: 3000, // 3秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物数量（用于验证）
    this.countText = this.add.text(16, 16, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加提示文本
    this.add.text(400, 300, 'Pink obstacles will fall every 3 seconds', {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  spawnObstacle() {
    // 随机 x 坐标（考虑障碍物宽度，避免超出边界）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 在顶部创建障碍物
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置向下速度为 360
    obstacle.setVelocityY(360);
    
    // 增加计数
    this.obstacleCount++;
    this.countText.setText(`Obstacles: ${this.obstacleCount}`);

    console.log(`Obstacle ${this.obstacleCount} spawned at x: ${randomX}`);
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物
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