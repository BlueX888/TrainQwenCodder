class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 状态信号：记录生成的障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();

    // 创建物理组管理障碍物
    this.obstacles = this.physics.add.group({
      defaultKey: 'obstacle',
      maxSize: 100 // 限制最大数量避免性能问题
    });

    // 创建定时器：每 1 秒生成一个障碍物
    this.time.addEvent({
      delay: 1000, // 1 秒
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, 'Obstacles: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });
  }

  spawnObstacle() {
    // 在顶部随机 x 位置生成障碍物
    const randomX = Phaser.Math.Between(20, 780);
    const obstacle = this.obstacles.create(randomX, -20, 'obstacle');
    
    if (obstacle) {
      // 设置向下速度为 240
      obstacle.setVelocityY(240);
      
      // 更新状态
      this.obstacleCount++;
      this.statusText.setText(`Obstacles: ${this.obstacleCount}`);
    }
  }

  update(time, delta) {
    // 清理超出屏幕底部的障碍物
    this.obstacles.children.entries.forEach(obstacle => {
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
  backgroundColor: '#222222',
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