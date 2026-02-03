class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.totalDistance = 0; // 可验证的状态信号
    this.objects = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('cyanBox', 40, 40);
    graphics.destroy();

    // 创建 3 个青色对象，分别放置在不同位置
    const positions = [
      { x: 200, y: 300 },
      { x: 400, y: 300 },
      { x: 600, y: 300 }
    ];

    positions.forEach(pos => {
      const obj = this.physics.add.sprite(pos.x, pos.y, 'cyanBox');
      obj.setCollideWorldBounds(true); // 限制在世界边界内
      this.objects.push(obj);
    });

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示移动距离
    this.distanceText = this.add.text(16, 16, 'Distance: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(16, 50, 'Use Arrow Keys to move all objects', {
      fontSize: '18px',
      fill: '#00ffff'
    });
  }

  update(time, delta) {
    const speed = 240;
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键状态
    if (this.cursors.left.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown) {
      velocityY = speed;
    }

    // 同步更新所有对象的速度
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 计算移动距离（基于第一个对象）
    if (velocityX !== 0 || velocityY !== 0) {
      const distance = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      this.totalDistance += distance * (delta / 1000);
      this.distanceText.setText('Distance: ' + Math.floor(this.totalDistance));
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);