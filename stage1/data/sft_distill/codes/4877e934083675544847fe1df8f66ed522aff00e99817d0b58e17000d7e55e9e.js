class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.objectCount = 3; // 物体数量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillCircle(25, 25, 25); // 半径25的圆
    graphics.generateTexture('orangeCircle', 50, 50);
    graphics.destroy();

    // 创建物理组
    this.orangeGroup = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建3个橙色物体
    for (let i = 0; i < this.objectCount; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const orange = this.orangeGroup.create(x, y, 'orangeCircle');
      
      // 设置随机移动方向，速度为160
      const angle = Phaser.Math.Between(0, 360);
      const velocity = this.physics.velocityFromAngle(angle, 160);
      orange.setVelocity(velocity.x, velocity.y);
      
      // 设置圆形碰撞体（更精确的碰撞检测）
      orange.setCircle(25);
    }

    // 添加物体间的碰撞检测
    this.physics.add.collider(
      this.orangeGroup,
      this.orangeGroup,
      this.handleCollision,
      null,
      this
    );

    // 显示碰撞计数器（用于验证）
    this.collisionText = this.add.text(16, 16, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示物体数量
    this.add.text(16, 50, `Objects: ${this.objectCount}`, {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示速度信息
    this.add.text(16, 84, 'Speed: 160', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  handleCollision(obj1, obj2) {
    // 碰撞发生时增加计数器
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
    
    // 可选：添加视觉反馈
    obj1.setTint(0xffff00); // 短暂变黄
    obj2.setTint(0xffff00);
    
    this.time.delayedCall(100, () => {
      obj1.clearTint();
      obj2.clearTint();
    });
  }

  update(time, delta) {
    // 确保速度保持在160左右（补偿物理引擎的微小损耗）
    this.orangeGroup.children.entries.forEach(orange => {
      const currentSpeed = Math.sqrt(
        orange.body.velocity.x ** 2 + orange.body.velocity.y ** 2
      );
      
      // 如果速度偏差较大，重新标准化
      if (Math.abs(currentSpeed - 160) > 5) {
        const scale = 160 / currentSpeed;
        orange.body.velocity.x *= scale;
        orange.body.velocity.y *= scale;
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