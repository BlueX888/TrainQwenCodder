// 完整的 Phaser3 代码
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
  }

  preload() {
    // 使用 Graphics 创建红色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('redBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理组
    this.redObjects = this.physics.add.group({
      key: 'redBall',
      repeat: 4, // 创建 5 个物体（1个初始 + 4个重复）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个物体的随机位置和速度
    const speed = 120;
    this.redObjects.children.entries.forEach((obj, index) => {
      // 随机位置（避免重叠）
      obj.setPosition(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550)
      );

      // 随机方向，但保持总速度为 120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      obj.setVelocity(vx, vy);

      // 设置完全弹性碰撞
      obj.setBounce(1, 1);
    });

    // 添加物体间的碰撞检测
    this.physics.add.collider(
      this.redObjects,
      this.redObjects,
      this.handleCollision,
      null,
      this
    );

    // 显示碰撞计数（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  handleCollision(obj1, obj2) {
    // 碰撞时增加计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保物体速度保持恒定（可选，防止浮点误差累积）
    this.redObjects.children.entries.forEach((obj) => {
      const velocity = obj.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差较大，重新归一化到 120
      if (Math.abs(currentSpeed - 120) > 1) {
        const scale = 120 / currentSpeed;
        obj.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

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

new Phaser.Game(config);