class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需预加载外部资源
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

    // 创建10个橙色物体
    for (let i = 0; i < 10; i++) {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const orangeObj = this.orangeGroup.create(x, y, 'orangeCircle');
      
      // 设置随机方向的速度，总速度为200
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 200;
      const velocityY = Math.sin(angle) * 200;
      
      orangeObj.setVelocity(velocityX, velocityY);
      orangeObj.setBounce(1, 1); // 完全反弹
      orangeObj.setCollideWorldBounds(true);
      orangeObj.setCircle(20); // 设置圆形碰撞体
    }

    // 设置物体间的碰撞检测
    this.physics.add.collider(
      this.orangeGroup,
      this.orangeGroup,
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
    // 记录碰撞次数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保物体速度保持在200左右（由于浮点误差可能会有微小变化）
    this.orangeGroup.children.entries.forEach(obj => {
      const currentSpeed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
      
      // 如果速度偏离200太多，重新标准化
      if (Math.abs(currentSpeed - 200) > 5) {
        const angle = Math.atan2(obj.body.velocity.y, obj.body.velocity.x);
        obj.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
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