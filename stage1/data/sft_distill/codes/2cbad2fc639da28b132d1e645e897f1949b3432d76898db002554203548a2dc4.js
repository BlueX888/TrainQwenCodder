class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeObjectsCount = 0; // 状态信号：活跃物体数量
    this.totalCollisions = 0; // 状态信号：总碰撞次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(16, 16, 16); // 半径16的圆形
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.objectGroup = this.physics.add.group({
      defaultKey: 'yellowBall',
      bounceX: 1, // X轴完全反弹
      bounceY: 1, // Y轴完全反弹
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 创建 20 个黄色物体
    for (let i = 0; i < 20; i++) {
      // 随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const obj = this.objectGroup.create(x, y, 'yellowBall');
      
      // 设置随机速度方向，速度大小为 120
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(angle * Math.PI / 180) * 120;
      const velocityY = Math.sin(angle * Math.PI / 180) * 120;
      
      obj.setVelocity(velocityX, velocityY);
      
      // 设置碰撞体
      obj.setCircle(16); // 设置圆形碰撞体
    }

    // 更新活跃物体数量
    this.activeObjectsCount = this.objectGroup.getLength();

    // 设置物体间的碰撞检测
    this.physics.add.collider(
      this.objectGroup, 
      this.objectGroup,
      this.handleCollision,
      null,
      this
    );

    // 添加文本显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 570, '20个黄色物体以120速度随机移动，碰撞时反弹', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  handleCollision(obj1, obj2) {
    // 碰撞回调函数
    this.totalCollisions++;
    
    // 确保速度保持在 120 左右（由于浮点误差可能会有偏差）
    const speed1 = Math.sqrt(obj1.body.velocity.x ** 2 + obj1.body.velocity.y ** 2);
    const speed2 = Math.sqrt(obj2.body.velocity.x ** 2 + obj2.body.velocity.y ** 2);
    
    if (Math.abs(speed1 - 120) > 5) {
      const angle1 = Math.atan2(obj1.body.velocity.y, obj1.body.velocity.x);
      obj1.setVelocity(Math.cos(angle1) * 120, Math.sin(angle1) * 120);
    }
    
    if (Math.abs(speed2 - 120) > 5) {
      const angle2 = Math.atan2(obj2.body.velocity.y, obj2.body.velocity.x);
      obj2.setVelocity(Math.cos(angle2) * 120, Math.sin(angle2) * 120);
    }
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `活跃物体: ${this.activeObjectsCount}`,
      `总碰撞次数: ${this.totalCollisions}`,
      `运行时间: ${Math.floor(time / 1000)}s`
    ]);

    // 确保所有物体保持 120 的速度
    this.objectGroup.children.entries.forEach(obj => {
      const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
      
      // 如果速度偏差较大，重新校正
      if (Math.abs(speed - 120) > 10) {
        const angle = Math.atan2(obj.body.velocity.y, obj.body.velocity.x);
        obj.setVelocity(Math.cos(angle) * 120, Math.sin(angle) * 120);
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);