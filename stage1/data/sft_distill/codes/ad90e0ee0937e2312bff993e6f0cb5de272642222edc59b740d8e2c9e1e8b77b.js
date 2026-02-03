// 游戏场景类
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 记录生成的障碍物数量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      obstacleCount: 0,
      obstacles: []
    };

    // 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组来管理障碍物
    this.obstaclesGroup = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 50 // 限制最大数量避免内存泄漏
    });

    // 创建定时器事件，每 2.5 秒生成一个障碍物
    this.spawnTimer = this.time.addEvent({
      delay: 2500, // 2.5 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 立即生成第一个障碍物
    this.spawnObstacle();

    // 添加调试文本显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  spawnObstacle() {
    // 从顶部随机 x 位置生成
    const randomX = Phaser.Math.Between(50, 750);
    const startY = -50; // 从屏幕上方开始

    // 从对象池获取或创建新障碍物
    const obstacle = this.obstaclesGroup.get(randomX, startY, 'obstacle');
    
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      obstacle.body.setVelocityY(160); // 设置向下速度为 160
      
      // 更新计数
      this.obstacleCount++;
      
      // 更新信号对象
      window.__signals__.obstacleCount = this.obstacleCount;
      window.__signals__.obstacles.push({
        id: this.obstacleCount,
        x: randomX,
        y: startY,
        velocityY: 160,
        timestamp: Date.now()
      });

      // 输出日志 JSON
      console.log(JSON.stringify({
        event: 'obstacle_spawned',
        count: this.obstacleCount,
        position: { x: randomX, y: startY },
        velocity: 160,
        time: this.time.now
      }));
    }
  }

  update(time, delta) {
    // 更新调试文本
    this.debugText.setText([
      `Obstacles Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${this.obstaclesGroup.countActive(true)}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 清理超出屏幕底部的障碍物
    this.obstaclesGroup.children.entries.forEach((obstacle) => {
      if (obstacle.active && obstacle.y > 650) {
        // 回收到对象池
        obstacle.setActive(false);
        obstacle.setVisible(false);
        obstacle.body.setVelocity(0, 0);
        
        console.log(JSON.stringify({
          event: 'obstacle_removed',
          position: { x: obstacle.x, y: obstacle.y },
          time: this.time.now
        }));
      }
    });
  }
}

// 游戏配置
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

// 创建游戏实例
new Phaser.Game(config);