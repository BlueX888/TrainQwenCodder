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
    // 1. 程序化生成白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('whiteCircle', 32, 32);
    graphics.destroy();

    // 2. 创建物理组
    this.objectsGroup = this.physics.add.group({
      defaultKey: 'whiteCircle',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 3. 创建15个物体并设置随机速度
    for (let i = 0; i < 15; i++) {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const obj = this.objectsGroup.create(x, y, 'whiteCircle');
      
      // 设置随机方向的速度，总速度为360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 360;
      const velocityY = Math.sin(angle) * 360;
      
      obj.setVelocity(velocityX, velocityY);
      obj.setCircle(16); // 设置圆形碰撞体
    }

    // 4. 启用物体间的碰撞
    this.physics.add.collider(
      this.objectsGroup, 
      this.objectsGroup,
      this.handleCollision,
      null,
      this
    );

    // 5. 更新活跃物体数量
    this.activeObjectsCount = this.objectsGroup.getChildren().length;

    // 6. 添加调试文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 7. 添加边界可视化（可选）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0x00ff00, 0.5);
    bounds.strokeRect(0, 0, 800, 600);
  }

  handleCollision(obj1, obj2) {
    // 碰撞回调：增加碰撞计数
    this.totalCollisions++;
  }

  update(time, delta) {
    // 更新状态显示
    const objects = this.objectsGroup.getChildren();
    let totalSpeed = 0;
    
    objects.forEach(obj => {
      const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
      totalSpeed += speed;
    });
    
    const avgSpeed = totalSpeed / objects.length;
    
    this.statusText.setText([
      `Active Objects: ${this.activeObjectsCount}`,
      `Total Collisions: ${this.totalCollisions}`,
      `Avg Speed: ${avgSpeed.toFixed(2)}`
    ]);
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);