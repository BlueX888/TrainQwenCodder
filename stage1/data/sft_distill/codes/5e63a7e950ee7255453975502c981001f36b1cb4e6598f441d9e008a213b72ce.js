class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成橙色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组来管理障碍物
    this.obstacles = this.physics.add.group();

    // 设置定时器，每3秒生成一个障碍物
    this.time.addEvent({
      delay: 3000, // 3秒 = 3000毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加文本显示障碍物数量（用于验证）
    this.countText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(20, 780); // 留出边界
    
    // 创建物理精灵
    const obstacle = this.physics.add.sprite(randomX, -20, 'obstacle');
    
    // 设置向下速度为 360
    obstacle.setVelocityY(360);
    
    // 添加到物理组
    this.obstacles.add(obstacle);
    
    // 更新计数
    this.obstacleCount++;
    this.countText.setText('Obstacles: ' + this.obstacleCount);
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物（性能优化）
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