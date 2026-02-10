class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：生成的障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1); // 白色
    graphics.fillRect(0, 0, 32, 32); // 32x32 的方块
    graphics.generateTexture('obstacle', 32, 32);
    graphics.destroy();

    // 创建物理组来管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 100 // 限制最大障碍物数量，避免内存溢出
    });

    // 创建定时器，每 1 秒生成一个障碍物
    this.obstacleTimer = this.time.addEvent({
      delay: 1000, // 1000ms = 1 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff'
    });

    console.log('游戏开始：障碍物将每秒从顶部生成');
  }

  spawnObstacle() {
    // 随机 x 坐标（留出边距，避免障碍物被切割）
    const randomX = Phaser.Math.Between(16, 800 - 16);
    
    // 从物理组中获取或创建障碍物
    const obstacle = this.obstacles.get(randomX, -16);
    
    if (obstacle) {
      // 激活障碍物
      obstacle.setActive(true);
      obstacle.setVisible(true);
      
      // 设置垂直速度为 160（向下）
      obstacle.setVelocityY(160);
      
      // 增加计数器
      this.obstacleCount++;
      
      console.log(`障碍物 #${this.obstacleCount} 生成于 x=${randomX}`);
    }
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `障碍物生成数量: ${this.obstacleCount}`,
      `当前活跃障碍物: ${this.obstacles.countActive(true)}`,
      `定时器运行中: ${this.obstacleTimer.paused ? '否' : '是'}`
    ]);

    // 清理超出屏幕的障碍物（回收到对象池）
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.active && obstacle.y > 600 + 32) {
        // 禁用障碍物，返回对象池
        obstacle.setActive(false);
        obstacle.setVisible(false);
        obstacle.setVelocity(0, 0);
        console.log(`障碍物已离开屏幕，回收到对象池`);
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
      gravity: { y: 0 }, // 不使用全局重力，手动控制速度
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);