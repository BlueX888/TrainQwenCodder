class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成灰色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组来管理障碍物
    this.obstacles = this.physics.add.group();

    // 创建定时器事件，每 1.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5 秒 = 1500 毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物数量（用于验证）
    this.obstacleText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(20, this.scale.width - 20);
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    // 设置障碍物下落速度为 300
    obstacle.setVelocityY(300);
    
    // 更新计数器
    this.obstacleCount++;
    this.obstacleText.setText('Obstacles: ' + this.obstacleCount);

    console.log(`Obstacle #${this.obstacleCount} spawned at x: ${randomX}`);
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.y > this.scale.height + 50) {
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
      gravity: { y: 0 }, // 不使用全局重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);