class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeObjects = 0; // 状态信号：活跃物体数量
    this.totalCollisions = 0; // 状态信号：总碰撞次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1); // 蓝色
    graphics.fillCircle(16, 16, 16); // 半径 16 的圆形
    graphics.generateTexture('blueCircle', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.blueObjects = this.physics.add.group({
      key: 'blueCircle',
      repeat: 14, // 创建 15 个物体（0-14）
      setXY: {
        x: Phaser.Math.Between(50, 750),
        y: Phaser.Math.Between(50, 550),
        stepX: 0,
        stepY: 0
      }
    });

    // 为每个物体设置属性
    this.blueObjects.children.iterate((child) => {
      // 设置反弹系数为 1（完全弹性碰撞）
      child.setBounce(1);
      
      // 设置与世界边界碰撞
      child.setCollideWorldBounds(true);
      
      // 设置随机速度方向，速度大小为 160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 160;
      const velocityY = Math.sin(angle) * 160;
      child.setVelocity(velocityX, velocityY);
      
      // 设置圆形碰撞体
      child.setCircle(16);
      
      this.activeObjects++;
    });

    // 添加物体之间的碰撞检测
    this.physics.add.collider(
      this.blueObjects,
      this.blueObjects,
      this.handleCollision,
      null,
      this
    );

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加调试信息（可选）
    console.log('游戏已创建：15 个蓝色物体，速度 160，启用碰撞反弹');
  }

  handleCollision(obj1, obj2) {
    // 碰撞回调函数
    this.totalCollisions++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `活跃物体: ${this.activeObjects}`,
      `总碰撞次数: ${this.totalCollisions}`,
      `运行时间: ${Math.floor(time / 1000)}s`
    ]);

    // 验证所有物体速度保持在 160 左右（允许浮点误差）
    this.blueObjects.children.iterate((child) => {
      const speed = Math.sqrt(
        child.body.velocity.x ** 2 + 
        child.body.velocity.y ** 2
      );
      
      // 如果速度偏离 160 太多，重新规范化（防止浮点累积误差）
      if (Math.abs(speed - 160) > 1) {
        const angle = Math.atan2(child.body.velocity.y, child.body.velocity.x);
        child.setVelocity(
          Math.cos(angle) * 160,
          Math.sin(angle) * 160
        );
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
      gravity: { y: 0 }, // 无重力
      debug: false // 设为 true 可显示碰撞体边界
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);