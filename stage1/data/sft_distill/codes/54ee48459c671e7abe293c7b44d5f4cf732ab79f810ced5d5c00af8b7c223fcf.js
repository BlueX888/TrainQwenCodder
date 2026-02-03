class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：已生成障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillRect(0, 0, 40, 40); // 40x40 像素的方块
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 创建障碍物组（用于管理多个障碍物）
    this.obstacles = this.physics.add.group();

    // 创建定时器事件：每 4000 毫秒（4秒）生成一个障碍物
    this.time.addEvent({
      delay: 4000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 添加文本显示障碍物数量
    this.countText = this.add.text(16, 16, 'Obstacles: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(40, 760); // 留出边界空间
    const obstacle = this.obstacles.create(randomX, -40, 'obstacleTexture');
    
    // 设置物理属性
    obstacle.setVelocityY(120); // 向下速度 120
    obstacle.body.setAllowGravity(false); // 不受重力影响
    
    // 更新计数器
    this.obstacleCount++;
    this.countText.setText('Obstacles: ' + this.obstacleCount);
    
    console.log(`Obstacle #${this.obstacleCount} spawned at x: ${randomX}`);
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物（优化性能）
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.y > 650) {
        obstacle.destroy();
      }
    });
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
      gravity: { y: 0 }, // 不使用全局重力
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);