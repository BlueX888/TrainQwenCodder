class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器事件：每2秒生成一个障碍物
    this.time.addEvent({
      delay: 2000, // 2秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（确保障碍物完全在屏幕内）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 创建障碍物（从顶部生成）
    const obstacle = this.obstacles.create(randomX, -20, 'obstacleTexture');
    
    // 设置垂直速度为 120
    obstacle.setVelocityY(120);
    
    // 增加计数器
    this.obstacleCount++;
    
    // 更新状态文本
    this.statusText.setText(`Obstacles: ${this.obstacleCount}`);
    
    console.log(`Obstacle spawned at x: ${randomX}, total: ${this.obstacleCount}`);
  }

  update(time, delta) {
    // 清理超出屏幕下方的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > 650) { // 超出屏幕底部
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);