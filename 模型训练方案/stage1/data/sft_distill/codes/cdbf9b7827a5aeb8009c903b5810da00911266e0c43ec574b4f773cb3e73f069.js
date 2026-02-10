class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.totalDistance = 0; // 可验证的状态信号
    this.objectCount = 10;
    this.moveSpeed = 200;
  }

  preload() {
    // 使用Graphics生成灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('grayBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理组来管理所有对象
    this.objectGroup = this.physics.add.group();

    // 创建10个灰色对象，随机分布
    for (let i = 0; i < this.objectCount; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const obj = this.objectGroup.create(x, y, 'grayBox');
      obj.setCollideWorldBounds(true); // 限制在世界边界内
    }

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示信息的文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateInfoText();
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -this.moveSpeed;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.moveSpeed;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.moveSpeed;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.moveSpeed;
      isMoving = true;
    }

    // 同步设置所有对象的速度
    this.objectGroup.children.entries.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 计算移动距离（用于状态验证）
    if (isMoving) {
      const distance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * (delta / 1000);
      this.totalDistance += distance;
      this.updateInfoText();
    }
  }

  updateInfoText() {
    this.infoText.setText(
      `Objects: ${this.objectCount}\n` +
      `Speed: ${this.moveSpeed}\n` +
      `Total Distance: ${this.totalDistance.toFixed(2)}\n` +
      `Use Arrow Keys to Move`
    );
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
      gravity: { y: 0 }, // 关闭重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);