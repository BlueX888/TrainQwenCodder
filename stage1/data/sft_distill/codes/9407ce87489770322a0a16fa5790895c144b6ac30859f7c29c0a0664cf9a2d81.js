class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 1. 使用 Graphics 生成灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacleTexture', 40, 40);
    graphics.destroy();

    // 2. 创建物理组管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacleTexture',
      maxSize: 20 // 限制最大障碍物数量，避免内存溢出
    });

    // 3. 设置定时器，每3秒生成一个障碍物
    this.time.addEvent({
      delay: 3000, // 3秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 4. 添加文本显示状态
    this.statusText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 5. 添加提示文本
    this.add.text(400, 300, 'Obstacles falling from top every 3 seconds', {
      fontSize: '16px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);
  }

  spawnObstacle() {
    // 随机 x 坐标（留出边距，避免障碍物部分超出屏幕）
    const randomX = Phaser.Math.Between(20, 780);
    
    // 从物理组获取或创建障碍物
    const obstacle = this.obstacles.get(randomX, -50);
    
    if (obstacle) {
      // 激活物理体
      obstacle.setActive(true);
      obstacle.setVisible(true);
      
      // 设置垂直速度为 160（向下）
      obstacle.body.setVelocity(0, 160);
      
      // 启用世界边界检测，超出底部时自动销毁
      obstacle.setCollideWorldBounds(false);
      obstacle.checkWorldBounds = true;
      
      // 当障碍物离开世界边界时，回收到对象池
      obstacle.once('outofbounds', () => {
        this.obstacles.killAndHide(obstacle);
        obstacle.body.stop();
      });
      
      // 更新状态
      this.obstacleCount++;
      this.statusText.setText(`Obstacles: ${this.obstacleCount}`);
      
      console.log(`Obstacle spawned at x=${randomX}, total count: ${this.obstacleCount}`);
    }
  }

  update(time, delta) {
    // 可选：清理超出屏幕底部的障碍物（双重保险）
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.active && obstacle.y > 650) {
        this.obstacles.killAndHide(obstacle);
        obstacle.body.stop();
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 不使用全局重力，手动设置速度
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);