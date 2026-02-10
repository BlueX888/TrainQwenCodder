class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('orangeCircle', 40, 40);
    graphics.destroy();

    // 创建物理组
    this.orangeGroup = this.physics.add.group({
      defaultKey: 'orangeCircle',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建 10 个橙色物体
    for (let i = 0; i < 10; i++) {
      // 随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const orange = this.orangeGroup.create(x, y, 'orangeCircle');
      
      // 设置随机方向的速度，速度大小为 200
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 200;
      const velocityY = Math.sin(angle) * 200;
      
      orange.setVelocity(velocityX, velocityY);
      orange.setCircle(20); // 设置碰撞体为圆形
    }

    // 设置物体之间的碰撞检测
    this.physics.add.collider(
      this.orangeGroup,
      this.orangeGroup,
      this.handleCollision,
      null,
      this
    );

    // 显示碰撞计数（调试用）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  handleCollision(obj1, obj2) {
    // 碰撞回调，增加计数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新碰撞计数显示
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
    
    // 确保物体速度保持在 200 左右（可选的速度修正）
    this.orangeGroup.getChildren().forEach(orange => {
      const velocity = orange.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏离太多，重新归一化到 200
      if (speed > 0 && Math.abs(speed - 200) > 10) {
        const scale = 200 / speed;
        orange.setVelocity(velocity.x * scale, velocity.y * scale);
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