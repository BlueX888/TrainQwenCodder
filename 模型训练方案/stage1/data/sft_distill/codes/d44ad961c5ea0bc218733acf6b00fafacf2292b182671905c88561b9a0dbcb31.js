class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistanceMoved = 0; // 可验证的状态信号
    this.moveSpeed = 360;
  }

  preload() {
    // 使用 Graphics 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('cyanCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建 12 个青色对象，随机分布在画布上
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.add.sprite(x, y, 'cyanCircle');
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示移动距离的文本
    this.distanceText = this.add.text(10, 10, 'Distance Moved: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 添加对象计数文本
    this.countText = this.add.text(10, 40, `Objects: ${this.objects.length}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 70, 'Use Arrow Keys to Move All Objects', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 计算移动向量
    let velocityX = 0;
    let velocityY = 0;

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

    // 如果有移动输入，同步移动所有对象
    if (velocityX !== 0 || velocityY !== 0) {
      const deltaSeconds = delta / 1000;
      const moveX = velocityX * deltaSeconds;
      const moveY = velocityY * deltaSeconds;

      // 计算移动距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistanceMoved += distance;

      // 同步移动所有对象
      this.objects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界处理：循环到对面
        if (obj.x < -20) obj.x = 820;
        if (obj.x > 820) obj.x = -20;
        if (obj.y < -20) obj.y = 620;
        if (obj.y > 620) obj.y = -20;
      });

      // 更新距离显示
      this.distanceText.setText(`Distance Moved: ${Math.floor(this.totalDistanceMoved)}`);
    }
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