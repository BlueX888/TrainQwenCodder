class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1); // 橙色
    graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组来管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 20 // 对象池最大数量
    });

    // 创建定时器事件，每2.5秒生成一个障碍物
    this.time.addEvent({
      delay: 2500, // 2.5秒 = 2500毫秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加调试文本显示障碍物数量
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 边界检测 - 移除超出屏幕的障碍物
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject && body.gameObject.texture.key === 'obstacle') {
        body.gameObject.destroy();
      }
    });
  }

  spawnObstacle() {
    // 随机 x 坐标（在屏幕宽度范围内，留出障碍物宽度边距）
    const randomX = Phaser.Math.Between(20, this.scale.width - 20);
    
    // 从顶部生成障碍物
    const obstacle = this.obstacles.get(randomX, -20);
    
    if (obstacle) {
      obstacle.setActive(true);
      obstacle.setVisible(true);
      
      // 设置物理属性
      obstacle.setVelocityY(200); // 向下速度200
      obstacle.body.setCollideWorldBounds(false); // 允许超出边界
      obstacle.body.onWorldBounds = true; // 启用边界事件
      
      // 增加计数器
      this.obstacleCount++;
    }
  }

  update(time, delta) {
    // 更新调试信息
    this.debugText.setText(`Obstacles spawned: ${this.obstacleCount}`);

    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach((obstacle) => {
      if (obstacle.active && obstacle.y > this.scale.height + 50) {
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
      gravity: { y: 0 }, // 不使用全局重力，手动控制速度
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);