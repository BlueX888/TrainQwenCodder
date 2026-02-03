class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 使用 Graphics 程序化生成白色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 50 // 限制最大数量避免内存泄漏
    });

    // 创建定时器事件，每 2 秒生成一个障碍物
    this.time.addEvent({
      delay: 2000, // 2 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });
  }

  spawnObstacle() {
    // 从顶部随机 X 位置生成障碍物
    const randomX = Phaser.Math.Between(20, 780);
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    if (obstacle) {
      // 设置向下速度为 80
      obstacle.setVelocityY(80);
      
      // 增加计数器
      this.obstacleCount++;
      
      // 更新状态文本
      this.statusText.setText(`Obstacles: ${this.obstacleCount}`);
    }
  }

  update() {
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
  backgroundColor: '#000000',
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