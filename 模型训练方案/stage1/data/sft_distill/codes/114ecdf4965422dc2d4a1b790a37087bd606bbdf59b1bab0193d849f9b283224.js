class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号：总移动距离
    this.moveSpeed = 200;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('grayBox', 32, 32);
    graphics.destroy();

    // 创建 10 个灰色对象并随机分布
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.physics.add.sprite(x, y, 'grayBox');
      obj.setCollideWorldBounds(true); // 防止对象移出边界
      this.objects.push(obj);
    }

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示总移动距离的文本
    this.distanceText = this.add.text(10, 10, 'Total Distance: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 40, 'Use Arrow Keys to move all objects', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键状态
    if (this.cursors.left.isDown) {
      velocityX = -this.moveSpeed;
    } else if (this.cursors.right.isDown) {
      velocityX = this.moveSpeed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.moveSpeed;
    } else if (this.cursors.down.isDown) {
      velocityY = this.moveSpeed;
    }

    // 同步设置所有对象的速度
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 计算移动距离（只在有移动时累加）
    if (velocityX !== 0 || velocityY !== 0) {
      const distance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * (delta / 1000);
      this.totalDistance += distance;
      this.distanceText.setText(`Total Distance: ${Math.floor(this.totalDistance)}`);
    }
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