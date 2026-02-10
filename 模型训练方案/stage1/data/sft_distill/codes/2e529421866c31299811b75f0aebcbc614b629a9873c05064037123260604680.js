class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号
    this.moveSpeed = 160;
  }

  preload() {
    // 使用Graphics创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('whiteBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建20个白色对象
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.add.image(x, y, 'whiteBox');
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(1000);

    // 添加说明文本
    this.add.text(10, 560, 'Use Arrow Keys to move all objects', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.updateStatus();
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键输入
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

    // 如果有移动，同步更新所有对象
    if (velocityX !== 0 || velocityY !== 0) {
      const deltaSeconds = delta / 1000;
      const moveX = velocityX * deltaSeconds;
      const moveY = velocityY * deltaSeconds;

      // 计算移动距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance;

      // 同步移动所有对象
      this.objects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界限制（可选，防止对象移出屏幕太远）
        obj.x = Phaser.Math.Clamp(obj.x, -100, 900);
        obj.y = Phaser.Math.Clamp(obj.y, -100, 700);
      });

      this.updateStatus();
    }
  }

  updateStatus() {
    this.statusText.setText(
      `Objects: ${this.objects.length}\n` +
      `Speed: ${this.moveSpeed}\n` +
      `Total Distance: ${Math.floor(this.totalDistance)}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);