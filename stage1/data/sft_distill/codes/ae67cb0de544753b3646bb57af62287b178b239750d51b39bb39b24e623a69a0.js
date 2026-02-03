class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      obstacleCount: 0,
      activeObstacles: 0,
      obstaclesDestroyed: 0
    };

    // 使用 Graphics 创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstaclesGroup = this.physics.add.group({
      defaultKey: 'obstacleTexture',
      maxSize: 50
    });

    // 添加定时器：每2秒生成一个障碍物
    this.time.addEvent({
      delay: 2000, // 2秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 添加文字显示统计信息
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 立即生成第一个障碍物
    this.spawnObstacle();
  }

  spawnObstacle() {
    // 在顶部随机X位置生成障碍物
    const randomX = Phaser.Math.Between(20, this.scale.width - 20);
    const obstacle = this.obstaclesGroup.get(randomX, -20);

    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      obstacle.setVelocityY(360); // 向下速度360

      // 增加计数
      this.obstacleCount++;
      window.__signals__.obstacleCount = this.obstacleCount;
      window.__signals__.activeObstacles = this.obstaclesGroup.countActive(true);

      // 输出日志
      console.log(JSON.stringify({
        event: 'obstacle_spawned',
        id: this.obstacleCount,
        x: randomX,
        y: -20,
        velocity: 360,
        timestamp: Date.now()
      }));
    }
  }

  update() {
    // 检查并移除超出屏幕底部的障碍物
    this.obstaclesGroup.children.entries.forEach(obstacle => {
      if (obstacle.active && obstacle.y > this.scale.height + 50) {
        obstacle.setActive(false);
        obstacle.setVisible(false);
        obstacle.setVelocity(0, 0);
        
        window.__signals__.obstaclesDestroyed++;
        window.__signals__.activeObstacles = this.obstaclesGroup.countActive(true);

        // 输出销毁日志
        console.log(JSON.stringify({
          event: 'obstacle_destroyed',
          reason: 'out_of_bounds',
          y: obstacle.y,
          timestamp: Date.now()
        }));
      }
    });

    // 更新统计文字
    this.statsText.setText([
      `Spawned: ${window.__signals__.obstacleCount}`,
      `Active: ${window.__signals__.activeObstacles}`,
      `Destroyed: ${window.__signals__.obstaclesDestroyed}`
    ]);
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
      gravity: { y: 0 }, // 不使用全局重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);