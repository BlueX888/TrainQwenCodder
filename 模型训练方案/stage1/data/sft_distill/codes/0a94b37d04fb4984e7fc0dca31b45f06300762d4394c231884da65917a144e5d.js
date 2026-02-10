class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：已生成障碍物数量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 生成白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1); // 白色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组用于管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 20 // 对象池最大容量
    });

    // 添加定时器，每1.5秒生成一个障碍物
    this.time.addEvent({
      delay: 1500, // 1.5秒 = 1500毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（留出边距，避免障碍物被裁切）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 从对象池获取或创建障碍物
    const obstacle = this.obstacles.get(randomX, -50);
    
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      
      // 设置垂直速度为 120（向下）
      obstacle.setVelocityY(120);
      
      // 更新状态
      this.obstacleCount++;
      this.statusText.setText(`Obstacles: ${this.obstacleCount}`);
    }
  }

  update() {
    // 回收超出屏幕的障碍物
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.active && obstacle.y > 650) {
        obstacle.setActive(false);
        obstacle.setVisible(false);
        obstacle.setVelocity(0, 0);
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
      gravity: { y: 0 }, // 无重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);