class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillCircle(25, 25, 25); // 半径25的圆形
    graphics.generateTexture('orangeCircle', 50, 50);
    graphics.destroy();

    // 创建物理组
    this.orangeGroup = this.physics.add.group({
      key: 'orangeCircle',
      repeat: 2, // 创建3个物体（0 + repeat 2）
      setXY: { 
        x: 100, 
        y: 100, 
        stepX: 250 // 水平间隔分布
      }
    });

    // 为每个物体设置属性
    this.orangeGroup.children.iterate((orange) => {
      // 设置反弹系数为1（完全弹性碰撞）
      orange.setBounce(1, 1);
      
      // 启用世界边界碰撞
      orange.setCollideWorldBounds(true);
      
      // 设置随机速度方向，速度大小为160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 160;
      const velocityY = Math.sin(angle) * 160;
      orange.setVelocity(velocityX, velocityY);
      
      // 设置圆形碰撞体（更精确的碰撞检测）
      orange.body.setCircle(25);
    });

    // 启用组内物体间的碰撞检测
    this.physics.add.collider(
      this.orangeGroup, 
      this.orangeGroup,
      this.handleCollision,
      null,
      this
    );

    // 添加调试文本显示碰撞次数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });
  }

  handleCollision(obj1, obj2) {
    // 碰撞回调函数，增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保速度保持在160左右（修正浮点误差）
    this.orangeGroup.children.iterate((orange) => {
      const body = orange.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过1，重新归一化到160
      if (Math.abs(currentSpeed - 160) > 1) {
        const scale = 160 / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);