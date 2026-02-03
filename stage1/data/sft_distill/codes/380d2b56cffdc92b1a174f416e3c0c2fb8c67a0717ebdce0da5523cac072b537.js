class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建橙色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 50 // 限制最大数量，避免内存泄漏
    });

    // 创建定时器，每 2.5 秒生成一个障碍物
    this.time.addEvent({
      delay: 2500, // 2.5 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物数量（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(20, this.scale.width - 20);
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    if (obstacle) {
      // 设置向下速度为 200
      obstacle.setVelocityY(200);
      
      // 更新计数
      this.obstacleCount++;
      this.countText.setText(`Obstacles: ${this.obstacleCount}`);
    }
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
      gravity: { y: 0 }, // 不使用重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);