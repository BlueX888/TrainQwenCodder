class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
    this.activeObstacles = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstaclesGroup = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 20
    });

    // 添加定时器：每3秒生成一个障碍物
    this.time.addEvent({
      delay: 3000, // 3秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });

    // 立即生成第一个障碍物
    this.spawnObstacle();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 添加底部边界检测，障碍物超出屏幕后销毁
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject && body.gameObject.active) {
        body.gameObject.destroy();
        this.activeObstacles--;
      }
    });
  }

  spawnObstacle() {
    // 从顶部随机位置生成
    const randomX = Phaser.Math.Between(20, 780);
    
    // 从对象池获取或创建新障碍物
    const obstacle = this.obstaclesGroup.get(randomX, -50);
    
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      
      // 设置物理属性
      obstacle.setVelocityY(360); // 下落速度 360
      obstacle.body.setCollideWorldBounds(false);
      obstacle.body.onWorldBounds = true;
      
      // 更新计数
      this.obstacleCount++;
      this.activeObstacles++;
      
      // 当障碍物超出屏幕底部时销毁
      obstacle.setData('checkBounds', true);
    }
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Total Spawned: ${this.obstacleCount}`,
      `Active Obstacles: ${this.activeObstacles}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 清理超出屏幕的障碍物
    this.obstaclesGroup.children.entries.forEach(obstacle => {
      if (obstacle.active && obstacle.y > 650) {
        obstacle.destroy();
        this.activeObstacles--;
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);